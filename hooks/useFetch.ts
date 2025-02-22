import { toast } from "sonner"
import { useState } from "react"

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: any;
  fn: (...args: any[]) => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export default function useFetch<T> (cb: (...args: any[]) => Promise<T>): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<any>(null)

    const fn = async (...args: any[]): Promise<void> => {
        setLoading(true)
        setError(null);

        try {
            const response = await cb(...args);
            setData(response);
            setError(null);
        } catch (error: any) {
            setError(error);
            toast.error(error.message);
        } finally{
            setLoading(false);
        }
    }
    return {data, loading, error, fn, setData};
}