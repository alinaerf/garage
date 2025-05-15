import { ClipLoader } from 'react-spinners';

export const LoadingSpinner = ({ loading }: { loading: boolean }) => {
  return (
    <ClipLoader
      color="#333"
      loading={loading}
      size={35}
      speedMultiplier={0.8}
    />
  );
};
