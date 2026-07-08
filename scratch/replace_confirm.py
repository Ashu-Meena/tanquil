import os
import re

def process_file(filepath, import_stmt, state_hook, handle_delete_old, handle_delete_new, modal_jsx, render_hook_search, render_hook_replace):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import
    if "ConfirmModal" not in content:
        # Find last import
        import_match = list(re.finditer(r'^import .*;?$', content, re.MULTILINE))
        if import_match:
            last_import = import_match[-1]
            content = content[:last_import.end()] + '\n' + import_stmt + content[last_import.end():]
        else:
            content = import_stmt + '\n' + content

    # Add state hook right after component declaration
    # Example: export default function Page() {
    comp_match = re.search(r'export default function [^{]+\{\s*', content)
    if comp_match and state_hook not in content:
        content = content[:comp_match.end()] + state_hook + '\n' + content[comp_match.end():]

    # Replace handle_delete
    content = content.replace(handle_delete_old, handle_delete_new)

    # Insert modal jsx
    content = content.replace(render_hook_search, render_hook_replace + '\n      ' + modal_jsx)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)


# 1. Categories Page
filepath_categories = r'c:\Users\pc\Desktop\tranquil\src\app\admin\(dashboard)\categories\page.tsx'
with open(filepath_categories, 'r', encoding='utf-8') as f:
    content = f.read()

import_stmt = 'import { ConfirmModal } from "@/components/ui/ConfirmModal";'
state_hook = '  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);'
handle_delete_old = '''  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) {
        toast.error("Error deleting category");
      } else {
        toast.success("Category deleted successfully");
        fetchCategories();
      }
    }
  };'''
handle_delete_new = '''  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    const { error } = await supabase.from("categories").delete().eq("id", categoryToDelete);
    if (error) {
      toast.error("Error deleting category");
    } else {
      toast.success("Category deleted successfully");
      fetchCategories();
    }
    setCategoryToDelete(null);
  };

  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
  };'''
modal_jsx = '''      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
      />'''
render_hook_search = '<div className="space-y-6 max-w-5xl">'
render_hook_replace = '<div className="space-y-6 max-w-5xl">'

process_file(filepath_categories, import_stmt, state_hook, handle_delete_old, handle_delete_new, modal_jsx, render_hook_search, render_hook_replace)


# 2. Reviews Page
filepath_reviews = r'c:\Users\pc\Desktop\tranquil\src\app\admin\(dashboard)\reviews\page.tsx'
import_stmt = 'import { ConfirmModal } from "@/components/ui/ConfirmModal";'
state_hook = '  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);'
handle_delete_old = '''  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) {
        toast.error("Error deleting review");
      } else {
        toast.success("Review deleted successfully");
        fetchReviews();
      }
    }
  };'''
handle_delete_new = '''  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    const { error } = await supabase.from("reviews").delete().eq("id", reviewToDelete);
    if (error) {
      toast.error("Error deleting review");
    } else {
      toast.success("Review deleted successfully");
      fetchReviews();
    }
    setReviewToDelete(null);
  };

  const handleDelete = (id: string) => {
    setReviewToDelete(id);
  };'''
modal_jsx = '''      <ConfirmModal
        isOpen={!!reviewToDelete}
        onClose={() => setReviewToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
      />'''
render_hook_search = '<div className="space-y-6">'
render_hook_replace = '<div className="space-y-6">'

process_file(filepath_reviews, import_stmt, state_hook, handle_delete_old, handle_delete_new, modal_jsx, render_hook_search, render_hook_replace)


# 3. Media Page
filepath_media = r'c:\Users\pc\Desktop\tranquil\src\app\admin\(dashboard)\media\page.tsx'
import_stmt = 'import { ConfirmModal } from "@/components/ui/ConfirmModal";'
state_hook = '  const [imageToDelete, setImageToDelete] = useState<string | null>(null);'
handle_delete_old = '''  const handleDelete = async (fileName: string) => {
    if (window.confirm("Are you sure you want to delete this image? It will break any links pointing to it.")) {
      await supabase.storage.from(bucketName).remove([fileName]);
      fetchFiles();
    }
  };'''
handle_delete_new = '''  const confirmDelete = async () => {
    if (!imageToDelete) return;
    await supabase.storage.from(bucketName).remove([imageToDelete]);
    fetchFiles();
    setImageToDelete(null);
  };

  const handleDelete = (fileName: string) => {
    setImageToDelete(fileName);
  };'''
modal_jsx = '''      <ConfirmModal
        isOpen={!!imageToDelete}
        onClose={() => setImageToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image? It will break any links pointing to it. This action cannot be undone."
        confirmText="Delete"
      />'''
render_hook_search = '<div className="space-y-6 max-w-full">'
render_hook_replace = '<div className="space-y-6 max-w-full">'

process_file(filepath_media, import_stmt, state_hook, handle_delete_old, handle_delete_new, modal_jsx, render_hook_search, render_hook_replace)

print("Done")
