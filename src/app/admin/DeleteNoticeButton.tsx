'use client';

export function DeleteNoticeButton() {
  return (
    <button 
      type="submit" 
      className="shrink-0 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-100 hover:text-red-700"
      onClick={(e) => {
        if (!confirm('确定要删除这条公告吗？')) {
          e.preventDefault();
        }
      }}
    >
      删除
    </button>
  );
}