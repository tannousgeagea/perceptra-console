import { UploadPage } from './upload'

// The UploadProvider lives in App.tsx (app-wide), so leaving this page keeps
// the selection and any uploads in progress.
const UploadIndex = () => <UploadPage />;

export default UploadIndex;
