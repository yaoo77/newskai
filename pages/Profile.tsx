
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { toast } from '../components/Toast';

export const Profile: React.FC = () => {
  const { user, profile, loading, reloadProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [finxUsername, setFinxUsername] = useState('');
  const [finxRefUrl, setFinxRefUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setXHandle(profile.xHandle || '');
      setFinxUsername(profile.finxUsername || '');
      setFinxRefUrl(profile.finxRefUrl || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await api.updateProfile(user.id, {
        displayName,
        xHandle,
        finxUsername,
        finxRefUrl,
      });
      await reloadProfile();
      toast('プロフィールを更新しました', 'success');
    } catch (error) {
      toast('プロフィールの更新に失敗しました', 'error');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">読み込み中...</div>;
  }
  
  if (!user || !profile) {
    return <div className="text-center p-8">プロファイルが見つかりません。</div>
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">プロフィール設定</h1>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center space-x-4 mb-8">
            <img src={profile.avatarUrl} alt={profile.displayName} className="w-20 h-20 rounded-full" />
            <div>
                <h2 className="text-2xl font-bold">{profile.displayName}</h2>
                <p className="text-slate-500">{user.email}</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-slate-700">表示名</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="xHandle" className="block text-sm font-medium text-slate-700">X ハンドル (@なし)</label>
            <input
              type="text"
              id="xHandle"
              value={xHandle}
              onChange={(e) => setXHandle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="finxUsername" className="block text-sm font-medium text-slate-700">Finx ユーザー名</label>
            <input
              type="text"
              id="finxUsername"
              value={finxUsername}
              onChange={(e) => setFinxUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="finxRefUrl" className="block text-sm font-medium text-slate-700">FINX 紹介リンク</label>
            <input
              type="url"
              id="finxRefUrl"
              value={finxRefUrl}
              onChange={(e) => setFinxRefUrl(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 transition-colors"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
