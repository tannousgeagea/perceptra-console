import { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "../../components/api/base";

const useFetchAnnotationClasses = (projectId: string) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/v1/annotations/classes?project_id=${projectId}`);
        setClasses(response.data.classes || []);
      } catch (err) {
        setError("Failed to fetch annotation classes.");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [projectId]);

  return { classes, loading, error };
};

export default useFetchAnnotationClasses;
