-- Create lists table
CREATE TABLE public.lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_template BOOLEAN NOT NULL DEFAULT false,
  template_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create list_items table
CREATE TABLE public.list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for lists
CREATE POLICY "Users can view their own lists" ON public.lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own lists" ON public.lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lists" ON public.lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lists" ON public.lists FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for list_items
CREATE POLICY "Users can view items of their lists" ON public.list_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.lists WHERE lists.id = list_items.list_id AND lists.user_id = auth.uid()));
CREATE POLICY "Users can insert items to their lists" ON public.list_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.lists WHERE lists.id = list_items.list_id AND lists.user_id = auth.uid()));
CREATE POLICY "Users can update items of their lists" ON public.list_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.lists WHERE lists.id = list_items.list_id AND lists.user_id = auth.uid()));
CREATE POLICY "Users can delete items from their lists" ON public.list_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.lists WHERE lists.id = list_items.list_id AND lists.user_id = auth.uid()));

-- Create trigger for updating timestamps
CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON public.lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_list_items_updated_at BEFORE UPDATE ON public.list_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();