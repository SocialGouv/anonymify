import { useMemo } from "react";
import { useDropzone } from "react-dropzone";

import styles from "./csv.module.css";

export const CsvDropZone = ({ onDrop }) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: "text/csv",
  });

  const acceptStyle = {
    borderColor: "#00e676",
  };

  const rejectStyle = {
    borderColor: "#ff1744",
  };

  const style = useMemo(
    () => ({
      ...(isDragActive ? acceptStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  return (
    <div {...getRootProps({ style })} className={styles.dropZone}>
      <input {...getInputProps()} />
      {<p>Glissez un fichier CSV ici</p>}
    </div>
  );
};
