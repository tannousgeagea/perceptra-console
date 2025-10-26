import { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "@/components/api/base";

interface AugmentationParameter {
  name: string;
  parameter_type: string;
  min_value?: number;
  max_value?: number;
  default_value?: number;
}

interface Augmentation {
  id: number;
  name: string;
  description: string;
  parameters: AugmentationParameter[];
}

export const useFetchAugmentations = () => {
  const [augmentations, setAugmentations] = useState<Augmentation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAugmentations = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/v1/augmentations`);
        setAugmentations(response.data);
      } catch (err) {
        setError("Failed to load augmentations");
      } finally {
        setLoading(false);
      }
    };

    fetchAugmentations();
  }, []);

  return { augmentations, loading, error };
};
