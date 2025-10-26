import ImageAnalysis from "@/components/analysis/ImageAnalysis";
import Header from "@/components/ui/header/Header";
import './Index.css'

const AnalysisPage = () => {
  return (
    <div className="analysis-container">
      <Header
        title="AI Image Analysis"
        description={`Upload an image to analyze it with our AI model`}
      />
      <ImageAnalysis />
    </div>
  );
};

export default AnalysisPage;