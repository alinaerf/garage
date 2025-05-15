'use client';

import React from 'react';
import Image from 'next/image';
import { ListingDetailsCardProps } from '../types';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const ListingDetailsCard: React.FC<ListingDetailsCardProps> = ({
  listingData,
  onDownloadPdf,
}) => {
  if (!listingData) return null;
  return (
    <div className="mt-8 p-6 border rounded-lg bg-card text-card-foreground shadow-sm animate-in fade-in duration-300">
      <h2 className="text-xl font-semibold tracking-tight mb-4">
        Listing Details
      </h2>

      {listingData.imageUrls && listingData.imageUrls.length > 0 && (
        <div className="relative w-full h-60 mb-4 ">
          <Image
            src={listingData.imageUrls[0]}
            alt={listingData.listingTitle}
            fill
            style={{ objectFit: 'contain' }}
            className="rounded-md border"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
          <p className="text-lg font-semibold">{listingData.listingTitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Brand</h3>
            <p>{listingData.itemBrand}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Year</h3>
            <p>{listingData.itemAge}</p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
          <p className="text-lg font-semibold text-primary">
            {formatCurrency(listingData.sellingPrice)}
          </p>
        </div>
        {listingData.categoryV2 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Category
            </h3>
            <p>{listingData.categoryV2.name}</p>
          </div>
        )}
        {listingData.pumpSize !== null &&
          listingData.pumpSize !== undefined && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Pump Size (GPM)
              </h3>
              <p>{listingData.pumpSize}</p>
            </div>
          )}
        {listingData.tankSize !== null &&
          listingData.tankSize !== undefined && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Tank Size (Gal)
              </h3>
              <p>{listingData.tankSize}</p>
            </div>
          )}
        {listingData.mileage !== null && listingData.mileage !== undefined && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Mileage
            </h3>
            <p>{listingData.mileage.toLocaleString()}</p>
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Description
          </h3>
          <p className="text-sm whitespace-pre-wrap">
            {listingData.listingDescription}
          </p>
        </div>
      </div>

      <button
        onClick={onDownloadPdf}
        className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        Download PDF
      </button>
    </div>
  );
};

export default ListingDetailsCard;
