import type { jsPDF } from 'jspdf';

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

export interface ApiResponse {
  result: {
    listing: Listing | null;
  };
  error?: string;
}
export interface ListingDetailsCardProps {
  listingData: Listing;
  onDownloadPdf: () => void;
}

export interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}
