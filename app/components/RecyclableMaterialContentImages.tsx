import { ImageOff, X } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/legacy/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomableImage } from "./ZoomableImage";
import { type RecyclableMaterialItem as RecyclableMaterialImageItem } from "@/types/types";


export const RecyclableMaterialContentImages = ({
  visualContent: RecyclableMaterialContent,
}: {
  visualContent: RecyclableMaterialImageItem["images"];
}) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  // Asegurarse de que 'evidence' sea un array antes de usar slice o length
  const validRecyclableMaterialContentImages = Array.isArray(RecyclableMaterialContent)
    ? RecyclableMaterialContent
    : [];
  const visibleRecyclableMaterialContentImages = showAll
    ? validRecyclableMaterialContentImages
    : validRecyclableMaterialContentImages.slice(0, 3);

  const handleImageClick = (url: string) => {
    setSelectedMedia(url);
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  if (validRecyclableMaterialContentImages.length === 0) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Sin archivos disponibles
      </p>
    );
  }

  return (
    <div className="mt-2">
      <div className="relative flex flex-wrap items-center gap-2">
        {visibleRecyclableMaterialContentImages.map((ev) => (
          <motion.div
            key={ev.id}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            className="relative h-24 w-24 cursor-pointer overflow-hidden rounded-md bg-gray-100 shadow-sm"
            onClick={() => {
              // Asegurarse de que publicDisplayUrl exista y sea una imagen
              if (ev.url) {
                handleImageClick(ev.url);
              } else if (ev.url) {
                // Para otros tipos de archivo, se podría abrir en una nueva pestaña o manejar diferente
                window.open(ev.url, "_blank");
              }
            }}
          >
            {ev.url ? (
              <Image
                src={ev.url}
                alt={ev.id || "Contenido Visual"}
                layout="fill"
                objectFit="cover" // cover puede ser mejor para miniaturas
                priority={false} // No todas necesitan ser priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg"; // Placeholder genérico
                  target.alt = "Error al cargar imagen";
                }}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gray-200 p-1 text-center text-gray-500">
                <ImageOff className="mb-0.5 h-6 w-6" />
                <span className="text-xs">No disponible</span>
              </div>
            )}
          </motion.div>
        ))}
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed left-0 top-0 z-[5000] flex min-h-screen w-full cursor-pointer items-center justify-center bg-black/80 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              className="relative flex max-h-full max-w-full items-center justify-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia && (
                <ZoomableImage src={selectedMedia} alt="Evidencia ampliada" />
              )}
            </motion.div>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              className="absolute top-0 mt-3 border-none bg-teal-400 text-white"
            >
              <X className="h-5 w-5 font-bold" />
              Cerrar
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
