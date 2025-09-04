const LoaderCircle = () => {
  return (
    <div className="flex h-40 items-center justify-center">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-schoMetricsBaseColor/30 border-t-schoMetricsBaseColor"></div>
        <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-schoMetricsBaseColor/40 opacity-20"></div>
      </div>
    </div>
  );
};

export default LoaderCircle;
