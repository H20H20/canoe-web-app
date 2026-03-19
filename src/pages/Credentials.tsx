import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, FileText, ShieldCheck, UploadCloud } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

type DocumentType = { id: string; label: string };

type ProviderDocument = {
  id?: number;
  provider_id?: number;
  document_type: string;
  file_url: string;
  status: string;
  created_at?: string;
  reviewed_at?: string | null;
};

type ProviderProfileForKyc = {
  profile_pic?: string | null;
  specialisations?: { id: number; item_name: string }[];
};

type SetupStatus = {
  setupComplete: boolean;
  missing: string[];
};

export default function Credentials() {
  const { user } = useAuth();
  const isProvider = user?.role === 'provider';
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [documents, setDocuments] = useState<ProviderDocument[]>([]);
  const [filesByType, setFilesByType] = useState<Record<string, File | null>>({});
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfileForKyc | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [typesRes, docsRes, profileRes, setupRes] = await Promise.all([
        api.get('/providers/document-types'),
        api.get('/providers/documents'),
        api.get('/providers/profile'),
        api.get('/providers/setup-status'),
      ]);

      const typesParsed = await api.parseResponse<{ data?: DocumentType[] }>(typesRes);
      setDocTypes(Array.isArray(typesParsed?.data) ? typesParsed.data : []);

      const docsParsed = await api.parseResponse<{ data?: ProviderDocument[] }>(docsRes);
      setDocuments(Array.isArray(docsParsed?.data) ? docsParsed.data : []);

      const profileParsed = await api.parseResponse<{
        data?: { provider?: ProviderProfileForKyc; specialisations?: ProviderProfileForKyc['specialisations'] };
      }>(profileRes);
      const provider = profileParsed?.data?.provider;
      const specialisations = Array.isArray(profileParsed?.data?.specialisations) ? profileParsed.data.specialisations : [];
      setProviderProfile(provider ? { ...provider, specialisations } : null);

      const setupParsed = await api.parseResponse<{ data?: SetupStatus }>(setupRes);
      const ds = setupParsed?.data;
      setSetupStatus({
        setupComplete: !!ds?.setupComplete,
        missing: Array.isArray(ds?.missing) ? ds.missing : [],
      });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isProvider) return;
    loadData();
  }, [isProvider]);

  const latestDocByType = useMemo(() => {
    const map: Record<string, ProviderDocument | undefined> = {};
    // documents come ordered DESC, so the first match is the latest.
    for (const d of documents) {
      if (!map[d.document_type]) map[d.document_type] = d;
    }
    return map;
  }, [documents]);

  const latestApprovedDocByType = useMemo(() => {
    const map: Record<string, ProviderDocument | undefined> = {};
    for (const d of documents) {
      if (d.status !== 'approved') continue;
      if (!map[d.document_type]) map[d.document_type] = d;
    }
    return map;
  }, [documents]);

  const approvedExistsByType = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const d of documents) {
      if (d.status === 'approved') map[d.document_type] = true;
    }
    return map;
  }, [documents]);

  const statusChip = (status?: string, isVerifiedOverride?: boolean) => {
    if (isVerifiedOverride) return { label: 'Verified', styles: 'bg-green-50 text-green-800 border-green-200' };
    switch (status) {
      case 'pending':
        return { label: 'Pending review', styles: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
      case 'approved':
        return { label: 'Verified', styles: 'bg-green-50 text-green-800 border-green-200' };
      case 'rejected':
        return { label: 'Rejected', styles: 'bg-red-50 text-red-800 border-red-200' };
      default:
        return { label: 'Not uploaded', styles: 'bg-gray-50 text-gray-800 border-gray-200' };
    }
  };

  const getDocStatusForType = (typeId: string) => {
    const approved = approvedExistsByType[typeId];
    if (approved) return { ...statusChip('approved', true) };
    const latest = latestDocByType[typeId];
    return statusChip(latest?.status, false);
  };

  const idFrontLatest = latestDocByType['id_front'];
  const idBackLatest = latestDocByType['id_back'];
  const idVerified = !!approvedExistsByType['id_front'] && !!approvedExistsByType['id_back'];
  const idRejected = idFrontLatest?.status === 'rejected' || idBackLatest?.status === 'rejected';
  const idPending = idFrontLatest?.status === 'pending' || idBackLatest?.status === 'pending';
  const idChip = idVerified ? statusChip('approved', true) : statusChip(idRejected ? 'rejected' : idPending ? 'pending' : undefined, false);

  const hasProfilePic = !!providerProfile?.profile_pic;
  const hasSpecialisations = (providerProfile?.specialisations?.length ?? 0) > 0;
  const setupComplete = !!setupStatus?.setupComplete;

  const handleUploadForType = async (typeId: string) => {
    const file = filesByType[typeId];
    if (!file) {
      toast.error('Choose a file to upload');
      return;
    }

    setUploadingType(typeId);
    try {
      const fd = new FormData();
      fd.append('document_type', typeId);
      fd.append('file', file);

      await api.parseResponse(await api.post('/providers/documents', fd));

      toast.success('Uploaded. Status is pending until reviewed.');
      setFilesByType((prev) => ({ ...prev, [typeId]: null }));
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploadingType((prev) => (prev === typeId ? null : prev));
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    setDeletingDocId(docId);
    try {
      await api.parseResponse(await api.del(`/providers/documents/${docId}`));
      toast.success('Document deleted');
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete document');
    } finally {
      setDeletingDocId((prev) => (prev === docId ? null : prev));
    }
  };

  const requiredDocTypes: { id: string; title: string; desc: string }[] = [
    { id: 'license', title: 'Upload your Medical License', desc: 'Required for verification.' },
    { id: 'qualification', title: 'Upload your Professional Certifications & credentials', desc: 'Required for verification.' },
  ];

  const requiredForWithdrawalDocTypes = ['id_front', 'id_back'];

  if (!isProvider) {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-gray-900">Credentials</h1>
          </div>
          <p className="text-sm text-gray-500">This page is available for providers only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-gray-900">Required documents</h1>
        </div>
        <p className="text-sm text-gray-500">Upload your required documents and wait for admin verification.</p>
      </div>
 
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 lg:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Required documents checklist</h2>

        <div className="space-y-3">
          {(['license', 'qualification'] as const).map((typeId) => {
            const docStatus = getDocStatusForType(typeId);
            const title =
              typeId === 'license'
                ? 'Upload your Medical License'
                : 'Upload your Professional Certifications & credentials';
            const note =
              typeId === 'license'
                ? 'Medical licence is required.'
                : 'Required for verification.';

            return (
              <div key={typeId} className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="text-[11px] text-primary font-semibold mt-1">{note}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <CheckCircle2 className={`w-4 h-4 ${docStatus.label === 'Verified' ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${docStatus.styles}`}>
                    {docStatus.label}
                  </span>
                </div>
              </div>
            );
          })}

          <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-3">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">Upload your National ID (front & back)</p>
              <p className="text-[11px] text-primary font-semibold mt-1">ID is required to withdraw money from your wallet.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <CheckCircle2 className={`w-4 h-4 ${idChip.label === 'Verified' ? 'text-green-600' : 'text-gray-300'}`} />
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${idChip.styles}`}>
                {idChip.label}
              </span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-3">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">Add your professional picture to your profile</p>
              <p className="text-[11px] text-gray-500 mt-1">Update from your Profile page.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <CheckCircle2 className={`w-4 h-4 ${hasProfilePic ? 'text-green-600' : 'text-gray-300'}`} />
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${hasProfilePic ? 'bg-green-50 text-green-800 border-green-200' : 'bg-gray-50 text-gray-800 border-gray-200'}`}>
                {hasProfilePic ? 'Verified' : 'Not completed'}
              </span>
              <Link to="/profile" className="text-sm font-semibold text-primary hover:underline">
                Go to Profile
              </Link>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-3">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">Add your specialty(ies) to your profile</p>
              <p className="text-[11px] text-gray-500 mt-1">Update from your Profile page.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <CheckCircle2 className={`w-4 h-4 ${hasSpecialisations ? 'text-green-600' : 'text-gray-300'}`} />
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${hasSpecialisations ? 'bg-green-50 text-green-800 border-green-200' : 'bg-gray-50 text-gray-800 border-gray-200'}`}>
                {hasSpecialisations ? 'Completed' : 'Not completed'}
              </span>
              <Link to="/profile" className="text-sm font-semibold text-primary hover:underline">
                Add specialities
              </Link>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-3">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">Complete your profile</p>
              {setupComplete ? (
                <p className="text-[11px] text-gray-500 mt-1">All required fields are filled.</p>
              ) : (
                <p className="text-[11px] text-gray-500 mt-1">
                  Missing: {(setupStatus?.missing ?? []).slice(0, 3).join(', ')}
                  {(setupStatus?.missing ?? []).length > 3 ? '…' : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <CheckCircle2 className={`w-4 h-4 ${setupComplete ? 'text-green-600' : 'text-gray-300'}`} />
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${setupComplete ? 'bg-green-50 text-green-800 border-green-200' : 'bg-gray-50 text-gray-800 border-gray-200'}`}>
                {setupComplete ? 'Completed' : 'Incomplete'}
              </span>
              <Link to="/profile" className="text-sm font-semibold text-primary hover:underline">
                Update
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">Document types</h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FileText className="w-4 h-4" />
            <span>Upload files; admin will review and verify.</span>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 mt-4">Loading…</p>
        ) : (
          <div className="mt-4 space-y-3">
            {docTypes.map((t) => {
              const file = filesByType[t.id] ?? null;
              const docStatus = getDocStatusForType(t.id);
              const isUploading = uploadingType === t.id;
              const required = requiredDocTypes.some((rd) => rd.id === t.id);
              const withdrawalRequired = requiredForWithdrawalDocTypes.includes(t.id);
              const previewDoc = latestApprovedDocByType[t.id] ?? latestDocByType[t.id];

              return (
                <div key={t.id} className="border-2 border-gray-100 rounded-xl p-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{t.label}</p>
                        {required && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                            Required
                          </span>
                        )}
                        {!required && withdrawalRequired && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                            Required to withdraw money from your wallet
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Status: <span className="font-semibold">{docStatus.label}</span></p>
                      {t.id === 'license' && <p className="text-[11px] text-primary font-semibold mt-1">Medical licence is required.</p>}
                      {(t.id === 'id_front' || t.id === 'id_back') && (
                        <p className="text-[11px] text-primary font-semibold mt-1">ID is required to withdraw money from your wallet.</p>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        className="w-full text-sm text-gray-600"
                        accept="image/*,application/pdf"
                        onChange={(e) => setFilesByType((prev) => ({ ...prev, [t.id]: e.target.files?.[0] ?? null }))}
                      />
                      {file && <p className="text-xs text-gray-500">Selected: <span className="font-medium text-gray-800">{file.name}</span></p>}

                      {previewDoc?.file_url ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={previewDoc.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                          >
                            Preview
                          </a>
                          {typeof previewDoc.id === 'number' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(previewDoc.id as number)}
                              disabled={deletingDocId === previewDoc.id}
                              className="px-3 py-2 rounded-xl border-2 border-red-200 text-sm font-semibold text-red-700 hover:bg-red-50 transition disabled:opacity-40"
                            >
                              {deletingDocId === previewDoc.id ? 'Deleting…' : 'Delete'}
                            </button>
                          )}
                        </div>
                      ) : null}

                      {previewDoc?.created_at ? (
                        <p className="text-[11px] text-gray-500">
                          Uploaded: {new Date(previewDoc.created_at).toLocaleDateString()}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${docStatus.styles}`}>
                        {docStatus.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUploadForType(t.id)}
                        disabled={isUploading}
                        className="px-4 py-2 rounded-xl border-2 border-transparent bg-primary hover:bg-primary-dark disabled:opacity-40 text-white font-semibold text-sm transition flex items-center gap-2"
                      >
                        <UploadCloud className="w-4 h-4" />
                        {isUploading ? 'Uploading…' : 'Upload'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 pt-2">
        Need help?{' '}
        <Link to="/contact" className="text-primary font-semibold hover:underline">
          Contact support
        </Link>
      </div>
    </div>
  );
}

