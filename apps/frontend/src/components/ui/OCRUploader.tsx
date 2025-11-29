import { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { Upload, FileText, X, Loader2, ScanLine } from 'lucide-react';

interface OCRUploaderProps {
    onTextExtracted: (text: string) => void;
}

export const OCRUploader = ({ onTextExtracted }: OCRUploaderProps) => {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setImage(event.target.result as string);
                    processImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = async (imageUrl: string) => {
        setLoading(true);
        setStatus('Initializing OCR engine...');
        setProgress(0);

        try {
            const worker = await createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                        setStatus(`Scanning document... ${Math.round(m.progress * 100)}%`);
                    } else {
                        setStatus(m.status);
                    }
                }
            });

            const { data: { text } } = await worker.recognize(imageUrl);
            await worker.terminate();

            onTextExtracted(text);
            setStatus('Scan complete!');
        } catch (error) {
            console.error('OCR Error:', error);
            setStatus('Failed to scan document.');
        } finally {
            setLoading(false);
        }
    };

    const clearImage = () => {
        setImage(null);
        setProgress(0);
        setStatus('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 hover:bg-slate-100 transition-colors">
            {!image ? (
                <div
                    className="text-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ScanLine className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-900">Scan ID or Document</h3>
                    <p className="text-xs text-slate-500 mt-1">Upload an image to auto-fill details</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white">
                        <img src={image} alt="Scanned doc" className="max-h-48 w-full object-contain bg-slate-900/5" />
                        <button
                            onClick={clearImage}
                            className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow-sm hover:bg-white text-slate-500 hover:text-red-500"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    {status}
                                </span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-600 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                            <FileText className="h-3.5 w-3.5" />
                            <span>Text extracted successfully</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
