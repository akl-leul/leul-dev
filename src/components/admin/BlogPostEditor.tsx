import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import { EditorToolbar } from './EditorToolbar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import './blog-editor.css';

interface BlogPostEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const BlogPostEditor = ({ content, onChange }: BlogPostEditorProps) => {
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'blog-image',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'blog-table',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'blog-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Underline,
      Youtube.configure({
        width: 640,
        height: 480,
        HTMLAttributes: {
          class: 'blog-video',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-media')
        .getPublicUrl(filePath);

      if (editor) {
        editor.chain().focus().setImage({ src: publicUrl }).run();
      }

      toast({
        title: 'Image uploaded',
        description: 'Your image has been successfully uploaded.',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleVideoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `blog-videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-media')
        .getPublicUrl(filePath);

      if (editor) {
        // Insert video as HTML5 video element
        const videoHtml = `<video controls class="blog-video" width="640" height="480"><source src="${publicUrl}" type="video/${fileExt}">Your browser does not support the video tag.</video>`;
        editor.chain().focus().insertContent(videoHtml).run();
      }

      toast({
        title: 'Video uploaded',
        description: 'Your video has been successfully uploaded.',
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload video. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      <EditorToolbar
        editor={editor}
        onImageUpload={handleImageUpload}
        onVideoUpload={handleVideoUpload}
      />
      <div className="border-t border-border">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
