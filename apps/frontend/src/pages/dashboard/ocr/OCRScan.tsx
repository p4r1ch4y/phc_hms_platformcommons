import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, UserPlus, FilePlus } from 'lucide-react';
import OCRUploader from '../../../components/ui/OCRUploader';

const OCRScan = () => {
    const navigate = useNavigate();
    const [scannedText, setScannedText] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleTextExtracted = (text: string) => {
        setScannedText(text);
        setIsProcessing(false);
    };

    const handleCreatePatient = () => {
        // Navigate to new patient form with state
        navigate('/dashboard/patients/new', { state: { scannedData: scannedText } });
    };

    const handleCreateConsultation = () => {
        // Navigate to new consultation form (this would ideally require selecting a patient first)
        // For now, we'll just go to the consultation list or a generic new consultation page if it existed without patient context
        // But our new consultation flow requires patient ID.
        // So we might need to find a patient first.
        // Let's just navigate to patients list for now with a toast message (simulated)
        alert('Please select a patient first to create a consultation from this text.');
        navigate('/dashboard/patients');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Scan Medical Report</h1>
                <p className="text-slate-500">Upload a photo of a medical report or prescription to extract text.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary-600" />
                            Upload Image
                        </h2>
                        <OCRUploader onTextExtracted={handleTextExtracted} />
                    </div>

                    {scannedText && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="font-semibold text-slate-900 mb-4">Next Steps</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={handleCreatePatient}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors text-left"
                                >
                                    <span className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <UserPlus className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <span className="block font-medium text-slate-900">Create New Patient</span>
                                            <span className="block text-sm text-slate-500">Use extracted text to fill details</span>
                                        </div>
                                    </span>
                                    <ArrowRight className="h-5 w-5 text-slate-400" />
                                </button>

                                <button
                                    onClick={handleCreateConsultation}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors text-left"
                                >
                                    <span className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                            <FilePlus className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <span className="block font-medium text-slate-900">Create Consultation</span>
                                            <span className="block text-sm text-slate-500">Add to existing patient record</span>
                                        </div>
                                    </span>
                                    <ArrowRight className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                    <h2 className="font-semibold text-slate-900 mb-4">Extracted Text</h2>
                    {scannedText ? (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 min-h-[300px] whitespace-pre-wrap text-sm text-slate-700 font-mono">
                            {scannedText}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                            <FileText className="h-12 w-12 mb-2 opacity-50" />
                            <p>No text extracted yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OCRScan;
