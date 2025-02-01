interface VehicleImagesProps {
  images?: string[];
}

export function VehicleImages({ images }: VehicleImagesProps) {
  if (!images?.length) return null;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2">Vehicle Images</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Vehicle image ${index + 1}`}
            className="w-full h-32 object-cover rounded"
          />
        ))}
      </div>
    </div>
  );
}