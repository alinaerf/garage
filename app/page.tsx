'use client';
import { useState } from 'react';
import { LoadingSpinner } from './components/spinner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ListingDetailsCard from './components/ListingDetailsCard';
import { Listing, ApiResponse, jsPDFWithAutoTable, ApiError } from './types'; 
import { formatCurrency } from './utils/currency';

export default function Home() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [listingData, setListingData] = useState<Listing | null>(null);

  const validateUrl = (input: string): string | null => {
    const regex =
      /https:\/\/www\.withgarage\.com\/listing\/.+-([a-f0-9\-]{36})$/;
    const match = input.match(regex);

    if (!match) {
      setError('Please enter a valid Garage listing URL.');
      return null;
    }

    const id = match[1];
    return id;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setListingData(null); // Clear previous listing data on new submission

    const id = validateUrl(url);
    if (!id) {
      setLoading(false);
      return; // Error is set by validateUrl
    }

    try {
      const response = await fetch(
        `https://garage-backend.onrender.com/getListing`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        }
      );

      let resultJson: ApiResponse | ApiError | null = null;
      try {
        resultJson = await response.json();
      } catch (jsonError) {
        console.warn('Could not parse JSON from API response:', jsonError);
      }

      if (!response.ok) {
        const errorMessage =
          (resultJson as ApiError)?.message ||
          `Request failed with status ${response.status}`;
        setError(errorMessage);
        setListingData(null);
        setLoading(false);
        return;
      }

      const apiResponse = resultJson as ApiResponse;

      if (apiResponse?.error) {
        setError(apiResponse.error);
        setListingData(null);
      } else if (apiResponse?.result?.listing) {
        setListingData(apiResponse.result.listing);
        setError(''); // Clear any previous errors on successful fetch
      } else {
        setError('Listing data not found in the response.');
        setListingData(null);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (err instanceof Error) {
        setError(`An error occurred: ${err.message}`);
      } else {
        setError('An unexpected error occurred while fetching the listing.');
      }
      setListingData(null);
    }
    setLoading(false);
  };

  const handleDownloadPdf = async () => {
    if (!listingData) return;

    const doc = new jsPDF() as jsPDFWithAutoTable; 
    let yPos = 22;

    doc.setFontSize(18);
    doc.text(listingData.listingTitle, 14, yPos);
    yPos += 10;

    if (listingData.imageUrls && listingData.imageUrls.length > 0) {
      const externalImageUrl = listingData.imageUrls[0];
      // Use the API proxy route
      const proxyImageUrl = `/api/image-proxy?imageUrl=${encodeURIComponent(externalImageUrl)}`;

      try {
        const imageResponse = await fetch(proxyImageUrl);
        if (!imageResponse.ok) {
          throw new Error(
            `Failed to fetch image via proxy: ${imageResponse.statusText}`
          );
        }
        const imageBlob = await imageResponse.blob();
        const imageObjectURL = URL.createObjectURL(imageBlob);

        const img = new Image();
        img.src = imageObjectURL;

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Determine image type from blob, default to jpeg
            const imageType =
              imageBlob.type.split('/')[1]?.toUpperCase() || 'JPEG';
            const dataUrl = canvas.toDataURL(imageBlob.type || 'image/jpeg');

            const imgProps = doc.getImageProperties(dataUrl);
            const pdfWidth = doc.internal.pageSize.getWidth() - 28;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            const maxHeight = 80;
            const finalHeight = Math.min(pdfHeight, maxHeight);
            const finalWidth = (imgProps.width * finalHeight) / imgProps.height;

            doc.addImage(dataUrl, imageType, 14, yPos, finalWidth, finalHeight);
            yPos += finalHeight + 10;
            URL.revokeObjectURL(imageObjectURL); // Clean up object URL
            resolve();
          };
          img.onerror = (err) => {
            console.error('Error loading image (from proxy) for PDF:', err);
            URL.revokeObjectURL(imageObjectURL); // Clean up object URL
            reject(new Error('Image loading failed'));
          };
        });
      } catch (e) {
        // Continue without image if there's an error
        console.error('Could not add image to PDF via proxy:', e);
      }
    }

    const tableColumn = ['Item', 'Details'];
    const tableRows: (string | number)[][] = [];

    tableRows.push(['Brand', listingData.itemBrand]);
    tableRows.push(['Year', listingData.itemAge]);
    tableRows.push(['Price', formatCurrency(listingData.sellingPrice)]);
    if (listingData.categoryV2?.name) {
      tableRows.push(['Category', listingData.categoryV2.name]);
    }
    if (listingData.pumpSize !== null && listingData.pumpSize !== undefined) {
      tableRows.push(['Pump Size (GPM)', listingData.pumpSize]);
    }
    if (listingData.tankSize !== null && listingData.tankSize !== undefined) {
      tableRows.push(['Tank Size (Gal)', listingData.tankSize]);
    }
    if (listingData.mileage !== null && listingData.mileage !== undefined) {
      tableRows.push(['Mileage', listingData.mileage.toLocaleString()]);
    }

    autoTable(doc, {
      startY: yPos,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { 
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: { 
        font: 'helvetica',
        cellPadding: 3, 
      },
      alternateRowStyles: { 
        fillColor: [245, 245, 245]
      },
      margin: { top: 10 },
    });

    yPos = doc.lastAutoTable.finalY + 10;

    doc.setFont('helvetica');
    doc.setFontSize(12);
    doc.text('Description:', 14, yPos);
    yPos += 6;
    const splitDescription = doc.splitTextToSize(
      listingData.listingDescription,
      doc.internal.pageSize.getWidth() - 28
    );
    doc.text(splitDescription, 14, yPos);

    doc.save(`listing-${listingData.id}.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12">
      <div className="w-full max-w-md p-6 space-y-6">
        {/* Input and Submit Section */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Invoice Generator
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your Garage listing URL below to generate an invoice
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (
                  error &&
                  (e.target.value === '' ||
                    e.target.value.startsWith(
                      'https://www.withgarage.com/listing/'
                    ))
                ) {
                  setError('');
                }
              }}
              placeholder="https://www.withgarage.com/listing/...-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className={`flex h-10 w-full rounded-md border ${
                error ? 'border-destructive' : 'border-input'
              } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              disabled={loading}
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}
          </div>
          {loading ? (
            <div className="inline-flex w-full items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 py-2">
              <LoadingSpinner loading={loading} />
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              disabled={loading || !url} // Disable if loading or URL is empty
            >
              Generate Invoice
            </button>
          )}
        </div>

        {/* Listing Display Section */}
        {listingData && (
          <ListingDetailsCard
            listingData={listingData}
            onDownloadPdf={handleDownloadPdf}
          />
        )}
      </div>
    </div>
  );
}
