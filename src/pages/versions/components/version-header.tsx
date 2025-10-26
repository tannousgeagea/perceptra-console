import { FC } from 'react';

interface VersionHeaderProps {
  mode: string;
}

export const VersionHeader: FC<VersionHeaderProps> = ({ mode }) => (
    <header className="version-header">
        <h1>{mode === "view" ? "Dataset Versions" : "Generate New Version"}</h1>
    </header>
);