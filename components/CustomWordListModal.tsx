import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Check, Trash2, Share2, BookOpen } from 'lucide-react';
import {
  CustomWordList,
  SAMPLE_EN_DICTATION_TEXT,
  buildCustomListShareUrl,
  formatItemsToEditableText,
  parseEnglishWordListInput
} from '../utils/customWordLists';

interface CustomWordListModalProps {
  isOpen: boolean;
  editingList?: CustomWordList | null;
  language: 'en' | 'cn';
  onClose: () => void;
  onSave: (payload: { id?: string; title: string; items: { display: string; translation?: string }[] }) => void;
  onDelete?: (id: string) => void;
}

export const CustomWordListModal: React.FC<CustomWordListModalProps> = ({
  isOpen,
  editingList,
  language,
  onClose,
  onSave,
  onDelete
}) => {
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingList) {
      setTitle(editingList.title);
      setRawText(formatItemsToEditableText(editingList.items));
    } else {
      setTitle('');
      setRawText('');
    }
    setCopiedShare(false);
  }, [isOpen, editingList]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const parsedItems = useMemo(() => parseEnglishWordListInput(rawText), [rawText]);

  if (!isOpen || typeof document === 'undefined') return null;

  const isCn = language === 'cn';
  const canSave = parsedItems.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: editingList?.id,
      title: title.trim() || (isCn ? '我的听写词表' : 'My Dictation List'),
      items: parsedItems
    });
    onClose();
  };

  const handleCopyShare = async () => {
    if (!canSave) return;
    const shareUrl = buildCustomListShareUrl({
      id: editingList?.id || 'share',
      title: title.trim() || (isCn ? '分享听写词表' : 'Shared Dictation List'),
      mode: 'EN_WORDS',
      items: parsedItems,
      createdAt: Date.now()
    });
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      window.setTimeout(() => setCopiedShare(false), 2200);
    } catch {
      window.prompt(isCn ? '复制下方链接发给其他家长：' : 'Copy share link:', shareUrl);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[88vh] bg-[#FFFDF8] rounded-3xl shadow-2xl border-2 border-[#EFE5D8] overflow-hidden flex flex-col"
      >
        {/* 顶部标题栏 */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 via-[#FFFBF2] to-amber-50 border-b border-[#EFE5D8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#1E7F5C] text-white flex items-center justify-center shadow-xs">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#2B211B] leading-tight">
                {editingList
                  ? isCn
                    ? '编辑听写词表'
                    : 'Edit Dictation List'
                  : isCn
                    ? '新建家长听写词表'
                    : 'New Dictation Word List'}
              </h3>
              <p className="text-xs font-medium text-[#7A6A5F]">
                {isCn
                  ? '直接粘贴老师发的单词（支持带中文释义），保存即可开启听写！'
                  : 'Paste words with optional translations to start dictation right away!'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-stone-100 text-[#7A6A5F] flex items-center justify-center border border-[#EAE0CF] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* 中部表单与实时解析预览 */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-extrabold text-[#5C4A3E] mb-1.5">
              {isCn ? '词表名称' : 'List Name'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isCn ? '例如：三年级 Unit 4 英语听写' : 'e.g. Grade 3 Unit 4 Words'}
              maxLength={32}
              className="w-full px-4 py-2.5 rounded-2xl bg-white border-2 border-[#EAE0CF] focus:border-[#1E7F5C] focus:outline-none text-sm font-bold text-[#2B211B] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-extrabold text-[#5C4A3E]">
                {isCn
                  ? '粘贴单词列表（每行一个，或逗号分隔）'
                  : 'Paste words (one per line or comma-separated)'}
              </label>
              <button
                type="button"
                onClick={() => {
                  if (!title.trim()) {
                    setTitle(isCn ? '英语日常听写示例' : 'Sample Dictation');
                  }
                  setRawText(SAMPLE_EN_DICTATION_TEXT);
                }}
                className="text-xs font-extrabold text-[#1E7F5C] hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={13} />
                {isCn ? '填入示例' : 'Load Sample'}
              </button>
            </div>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={
                isCn
                  ? '支持直接粘贴微信群内容，例如：\n1. apple 苹果\n2. banana 香蕉\n3. rainbow 彩虹'
                  : 'apple 苹果\nbanana 香蕉\nrainbow 彩虹'
              }
              className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-[#EAE0CF] focus:border-[#1E7F5C] focus:outline-none text-sm font-mono text-[#2B211B] leading-relaxed resize-none transition-colors"
            />
          </div>

          {/* 实时解析预览 */}
          <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-emerald-800">
                {isCn
                  ? `已智能识别 ${parsedItems.length} 个单词`
                  : `Parsed ${parsedItems.length} words`}
              </span>
              {parsedItems.length > 0 && (
                <span className="text-[11px] font-semibold text-emerald-700/80">
                  {isCn ? '最多支持 60 词/表' : 'Up to 60 words'}
                </span>
              )}
            </div>
            {parsedItems.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {parsedItems.map((it, idx) => (
                  <span
                    key={`${it.display}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-emerald-200/80 text-xs shadow-2xs"
                  >
                    <strong className="font-mono font-extrabold text-[#2B211B]">{it.display}</strong>
                    {it.translation && (
                      <span className="text-[#7A6A5F] font-medium">{it.translation}</span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#9A8B7E]">
                {isCn
                  ? '输入或粘贴英文单词后，这里会实时显示解析结果。'
                  : 'Type or paste English words above to preview them here.'}
              </p>
            )}
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="px-6 py-4 bg-white border-t border-[#EFE5D8] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            {editingList && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(editingList.id);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 size={14} />
                {isCn ? '删除' : 'Delete'}
              </button>
            )}
            <button
              type="button"
              disabled={!canSave}
              onClick={handleCopyShare}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 disabled:opacity-40 text-amber-800 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {copiedShare ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              {copiedShare
                ? isCn
                  ? '已复制分享链接!'
                  : 'Link Copied!'
                : isCn
                  ? '分享词表链接'
                  : 'Copy Share Link'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#5C4A3E] text-sm font-bold cursor-pointer transition-colors"
            >
              {isCn ? '取消' : 'Cancel'}
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#1E7F5C] hover:bg-emerald-800 disabled:opacity-40 text-white text-sm font-extrabold shadow-sm cursor-pointer transition-colors"
            >
              {isCn ? '保存词表' : 'Save List'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
