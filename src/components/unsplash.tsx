// components/UnsplashSelector.tsx
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"; // Assuming you're using shadcn
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string; // Add regular size for better quality
  };
  alt_description: string;
}

interface UnsplashSelectorProps {
  onImageSelect: (imageUrl: string) => void; // Add callback prop for image selection
}

const UnsplashSelector: React.FC<UnsplashSelectorProps> = ({ onImageSelect }) => {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      const res = await fetch(
        `https://api.unsplash.com/photos/random?count=3&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
      );
      const data: UnsplashImage[] = await res.json();
      setImages(data);
      setSelectedImageId(null); // Reset selection
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleImageSelect = (id: string) => {
    setSelectedImageId(id);
    const selectedImage = images.find(img => img.id === id);
    if (selectedImage) {
      onImageSelect(selectedImage.urls.regular); // Pass the URL to parent component
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button type='button' className="transition-all hover:scale-105" onClick={fetchImages}>Generate Images</Button>

      {images.length > 0 && (
        <RadioGroup
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          value={selectedImageId || ''}
          onValueChange={handleImageSelect}
        >
          {images.map((image) => (
            <div key={image.id} className="flex flex-col items-center space-y-2">
              <RadioGroupItem value={image.id} id={image.id} />
              <Label htmlFor={image.id}>
                <img
                  src={image.urls.small}
                  alt={image.alt_description || 'Unsplash Image'}
                  className="w-32 h-32 object-cover rounded-md border"
                />
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {selectedImageId && (
        <div className="text-sm text-green-600">
          Image Selected ✓
        </div>
      )}
    </div>
  );
};

export default UnsplashSelector;
