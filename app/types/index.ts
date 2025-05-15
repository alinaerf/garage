import type { jsPDF } from 'jspdf';

// Interface for the item data
export interface Listing {
  id: string;
  listingTitle: string;
  itemBrand: string;
  itemAge: number;
  sellingPrice: number;
  listingDescription: string;
  imageUrls: string[];
  pumpSize?: number;
  tankSize?: number;
  mileage?: number;
  categoryV2?: { name: string };
}

// Interface for the API response
export interface ApiResponse {
  result: {
    listing: Listing | null;
  };
  error?: string;
}

// Interface for the API error
export interface ApiError {
  message?: string;
}

// Interface for the listing details card props
export interface ListingDetailsCardProps {
  listingData: Listing;
  onDownloadPdf: () => void;
}

// Interface for the jsPDF with autoTable
export interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}
