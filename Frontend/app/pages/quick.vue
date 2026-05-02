<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'

const noteTitle = ref<string>('')
const isSaving = ref(false)
const showShareModal = ref(false)
const tempNoteId = ref<string | null>(null)
const { createTempNoteId } = useNotesApi();
const router = useRouter()

const goLogin = () => {
  router.push('/login')
}

const editor = useEditor({
  extensions: [
    StarterKit,
    CharacterCount
  ],
  content: '',
  onUpdate: ({ editor }) => {
    saveToLocal(noteTitle.value, editor.getJSON())
  }
})

const characterCount = computed(() => {
  return editor.value?.storage.characterCount.characters() || 0
})

const saveToLocal = (title: string, content: any) => {
  isSaving.value = true
  const data = {
    title,
    content,
    updatedAt: new Date().toISOString()
  }
  localStorage.setItem('inkwell_quick_note', JSON.stringify(data))
  setTimeout(() => {
    isSaving.value = false
  }, 500)
}

// const exportAsFile = () => {
//   const content = editor.value?.getText() || ''
//   const blob = new Blob([`Title: ${noteTitle.value}\n\n${content}`], { type: 'text/plain' })
//   const url = URL.createObjectURL(blob)
//   const link = document.createElement('a')
//   link.href = url
//   link.download = `${noteTitle.value || 'quick-note'}.txt`
//   link.click()
//   URL.revokeObjectURL(url)
// }

const openShareModal = () => {
  showShareModal.value = true
}

onMounted(async () => {
  const saved = localStorage.getItem('inkwell_quick_note')

  if (!saved) {
    const res = await createTempNoteId()
    tempNoteId.value = res.data.id

    localStorage.setItem('inkwell_quick_note_id', res.data.id)
  } else {
    tempNoteId.value = localStorage.getItem('inkwell_quick_note_id')
  }

  // 노트 복구
  const savedNote = localStorage.getItem('inkwell_quick_note')
  if (savedNote) {
    const parsed = JSON.parse(savedNote)
    noteTitle.value = parsed.title || ''
    editor.value?.commands.setContent(parsed.content || '')
  }
})

watch(noteTitle, (newTitle) => {
  saveToLocal(newTitle, editor.value?.getJSON())
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="note-container">
    <header class="editor-header">
      <div class="status-badge" :class="{ 'is-saving': isSaving }">
        {{ isSaving ? 'Saving to Local...' : 'Saved Locally' }}
      </div>
      <div class="header-actions">
        <button class="action-btn login-btn" @click="goLogin">
          Login
        </button>
        <!-- <button class="action-btn" title="Export" @click="exportAsFile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button> -->
        <button :disabled="!tempNoteId" class="action-btn" title="Share" @click="openShareModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
      </div>
    </header>

    <div class="note-editor-view">
      <div class="title-section">
        <textarea
          v-model="noteTitle"
          class="title-textarea"
          placeholder="Quick Note Title"
          rows="1"
          @input="(e: any) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }"
        ></textarea>
      </div>

      <div v-if="editor" class="editor-toolbar">
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
          class="toolbar-btn"
        >
          <b>B</b>
        </button>
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
          class="toolbar-btn"
        >
          <i>I</i>
        </button>
        <button
          @click="editor.chain().focus().toggleUnderline().run()"
          :class="{ 'is-active': editor.isActive('underline') }"
          class="toolbar-btn"
        >
          <u>U</u>
        </button>
        <div class="divider"></div>
        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor.isActive('bulletList') }"
          class="toolbar-btn"
        >
          • List
        </button>
      </div>

      <div class="content-section">
        <EditorContent :editor="editor" />
      </div>
    </div>

    <footer class="editor-footer">
      <div class="editor-info">
        <span class="count-item"><b>{{ characterCount }}</b> characters (Offline Mode)</span>
      </div>
    </footer>

    <ShareModal
      :show="showShareModal"
      :note-id="tempNoteId"
      :note-title="noteTitle"
      :note-content="editor?.getText() || ''"
      @close="showShareModal = false"
    />
  </div>
</template>

<style scoped>
.note-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
  position: relative;
}

.editor-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--color-gray-100);
}

.status-badge {
  font-size: 13px;
  color: var(--color-gray-400);
  transition: color 0.3s;
}

.status-badge.is-saving {
  color: var(--color-primary);
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--color-gray-200);
  background: #fff;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--color-gray-50);
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.editor-footer {
  height: 32px;
  border-top: 1px solid var(--color-gray-100);
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: var(--color-gray-50);
}

.editor-info {
  font-size: 12px;
  color: var(--color-gray-500);
}

.note-editor-view {
  flex: 1;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  max-width: 90%;
  margin: 0 auto;
  width: 100%;
  overflow-y: auto;
}

.title-section {
  margin-bottom: 32px;
}

.title-textarea {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 40px;
  font-weight: 800;
  color: var(--color-black);
  resize: none;
  padding: 0;
  line-height: 1.2;
  font-family: inherit;
  display: block;
}

.title-textarea::placeholder {
  color: var(--color-gray-200);
}

.content-section {
  min-height: 400px;
}

:deep(.tiptap) {
  outline: none;
  font-size: 18px;
  line-height: 1.7;
  color: var(--color-gray-700);
}

:deep(.tiptap p.is-editor-empty:first-child::before) {
  content: 'Write a quick note...';
  float: left;
  color: var(--color-gray-300);
  pointer-events: none;
  height: 0;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: var(--color-gray-50);
  border-radius: 8px;
  margin-bottom: 24px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-gray-600);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: var(--color-gray-200);
}

.toolbar-btn.is-active {
  background: var(--color-black);
  color: white;
}

.divider {
  width: 1px;
  height: 18px;
  background: var(--color-gray-200);
  margin: 0 8px;
}

:deep(.tiptap ul) {
  padding-left: 1.5rem;
  margin: 1rem 0;
  list-style-type: disc;
}

:deep(.tiptap li) {
  margin-bottom: 0.5rem;
}
</style>