import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProgress, EventType } from '../types';
import { api } from '../services/api';
import { DASHBOARD_CARDS } from '../constants';
import { ProgressBar } from '../components/ProgressBar';
import { Modal } from '../components/Modal';
import { toast } from '../components/Toast';
import { CopyIcon, CheckCircleIcon } from '../components/icons';

const DashboardCard: React.FC<{
  data: typeof DASHBOARD_CARDS[0];
  progress: number;
  onAction: (type: EventType, payload?: any) => void;
  finxRefUrl?: string;
}> = ({ data, progress, onAction, finxRefUrl }) => {
  const [copied, setCopied] = useState(false);

  const handleActionClick = () => {
    switch(data.actionType) {
      case 'X_SHARE':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('今日は #AIもくよう会 でアウトプット！')}&hashtags=AIもくよう会`, '_blank');
        onAction(EventType.X_SHARE, { form: 'x_share' });
        break;
      case 'EXTERNAL_LINK':
        window.open(data.externalLink, '_blank');
        const eventType = data.id === 'finx-profile' ? EventType.FINX_PROFILE_EDIT : EventType.FINX_INTRO_POST;
        onAction(eventType);
        break;
      case 'SELF_REPORT':
        const selfReportType = data.id === 'offsite-meeting' ? EventType.OFFSITE_PARTICIPATE : data.id === 'lt-win' ? EventType.LT_WIN : EventType.DAILY_DECLARATION;
        onAction(selfReportType);
        break;
      case 'MODAL_FORM':
        onAction(data.id === 'notes' ? EventType.NOTE_SUBMIT : EventType.TESTIMONIAL_SUBMIT, data.payload);
        break;
      case 'INVITE':
        onAction(EventType.INVITE_SELF_REPORT);
        break;
      default:
        break;
    }
  }
  
  const handleCopy = () => {
    if (finxRefUrl) {
      navigator.clipboard.writeText(finxRefUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-1">
      <div>
        <div className="flex items-center mb-3">
          <data.icon className="w-7 h-7 text-sky-500 mr-3" />
          <h2 className="text-xl font-bold text-slate-800">{data.title}</h2>
        </div>
        <p className="text-slate-500 text-sm mb-4 min-h-[40px]">{data.description}</p>
        {data.actionType === 'INVITE' && finxRefUrl && (
          <div className="mb-4">
            <div className="flex items-stretch rounded-md shadow-sm">
                <input type="text" readOnly value={finxRefUrl} className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-slate-300 bg-slate-50 text-slate-600 px-3 py-2"/>
                <button onClick={handleCopy} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200">
                    {copied ? <CheckCircleIcon className="w-5 h-5 text-emerald-500" /> : <CopyIcon className="w-5 h-5" />}
                </button>
            </div>
          </div>
        )}
        {data.goal && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-sky-700">進捗</span>
              <span className="text-sm font-medium text-slate-500">{progress} / {data.goal}</span>
            </div>
            <ProgressBar value={progress} max={data.goal} />
          </div>
        )}
        {data.id === 'daily-declaration' && (
             <p className="text-sm text-slate-600 mb-4">今日の宣言: <span className="font-bold text-lg text-sky-600">{progress}</span>回</p>
        )}
        {data.actionType === 'VIEW_ONLY' && (
             <p className="text-sm text-slate-600 mb-4">現在の投稿数: <span className="font-bold text-lg text-sky-600">{progress}</span></p>
        )}
      </div>
      <button 
        onClick={handleActionClick}
        disabled={data.actionType === 'VIEW_ONLY'}
        className={`w-full mt-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
          data.actionType === 'VIEW_ONLY' 
          ? 'bg-slate-300 cursor-not-allowed' 
          : 'bg-sky-500 hover:bg-sky-600'
        }`}
      >
        {data.actionText}
      </button>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{form: string} | null>(null);
  const [formState, setFormState] = useState({ url: '', title: '', text: '' });

  const fetchProgress = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const data = await api.getUserProgress(user.id);
        setProgress(data);
      } catch (error) {
        console.error("Failed to fetch progress", error);
        toast("進捗データの読み込みに失敗しました", 'error');
      } finally {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleAction = async (type: EventType, payload?: any) => {
    if (!user) return;
    if (payload?.form) {
      setModalContent(payload);
      setIsModalOpen(true);
    } else {
      try {
        await api.submitEvent(user.id, type);
        toast('アクティビティを記録しました！', 'success');
        fetchProgress();
      } catch (error) {
        toast('記録に失敗しました', 'error');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !modalContent) return;

    let eventType: EventType;
    let payload: object = {};

    if (modalContent.form === 'note') {
        eventType = EventType.NOTE_SUBMIT;
        payload = { url: formState.url, title: formState.title };
    } else if (modalContent.form === 'testimonial') {
        await api.submitTestimonial(user.id, formState.text);
        toast('応援メッセージを送信しました！承認をお待ちください。', 'success');
        setIsModalOpen(false);
        setFormState({ url: '', title: '', text: '' });
        return;
    } else if (modalContent.form === 'x_share') {
        eventType = EventType.X_SHARE;
        payload = { url: formState.url };
    } else {
        return;
    }
    
    try {
        await api.submitEvent(user.id, eventType, payload);
        toast('記録しました！', 'success');
        fetchProgress();
    } catch (error) {
        toast('記録に失敗しました', 'error');
    }
    
    setIsModalOpen(false);
    setFormState({ url: '', title: '', text: '' });
  };

  const getModalTitle = () => {
    if (!modalContent) return '';
    if (modalContent.form === 'note') return 'ノートを登録';
    if (modalContent.form === 'testimonial') return '応援メッセージを投稿';
    if (modalContent.form === 'x_share') return '投稿したTweet URLを登録';
    return '';
  }

  if (loading) return <div className="text-center p-10">進捗を読み込み中...</div>;
  if (!progress) return <div className="text-center p-10">進捗データを表示できません。</div>;
  
  return (
    <>
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">ダッシュボード</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DASHBOARD_CARDS.map(card => (
            <DashboardCard 
              key={card.id} 
              data={card} 
              // Fix: Cast the progress value to number as `progress[card.metric]` can be `string | number`
              // but we know it will be a number based on `DASHBOARD_CARDS` constant.
              progress={(progress[card.metric] as number) || 0}
              onAction={handleAction}
              finxRefUrl={profile?.finxRefUrl}
            />
          ))}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={getModalTitle()}>
        <form onSubmit={handleFormSubmit}>
            {modalContent?.form === 'note' && (
                <>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700">タイトル</label>
                        <input type="text" id="title" value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="url" className="block text-sm font-medium text-slate-700">URL</label>
                        <input type="url" id="url" value={formState.url} onChange={e => setFormState({...formState, url: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" required />
                    </div>
                </>
            )}
             {modalContent?.form === 'testimonial' && (
                <div className="mb-4">
                    <label htmlFor="text" className="block text-sm font-medium text-slate-700">メッセージ</label>
                    <textarea id="text" value={formState.text} onChange={e => setFormState({...formState, text: e.target.value})} rows={4} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" required />
                </div>
             )}
              {modalContent?.form === 'x_share' && (
                <div className="mb-4">
                    <label htmlFor="url" className="block text-sm font-medium text-slate-700">Tweet URL</label>
                    <input type="url" id="url" value={formState.url} onChange={e => setFormState({...formState, url: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" placeholder="任意入力" />
                    <p className="text-xs text-slate-500 mt-1">URL未入力でも投稿したこととして記録されます。</p>
                </div>
             )}
            <div className="flex justify-end mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 mr-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">キャンセル</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">送信</button>
            </div>
        </form>
      </Modal>
    </>
  );
};
