CREATE POLICY "Users can delete own services"
  ON public.services FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);