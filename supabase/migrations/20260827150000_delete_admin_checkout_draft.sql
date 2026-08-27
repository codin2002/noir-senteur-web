-- Allow only authorised administrators to remove a saved pre-payment checkout after follow-up.

create or replace function public.delete_admin_checkout_draft(p_draft_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.has_role((select auth.uid()), 'admin'::public.app_role) then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;

  delete from public.checkout_drafts
  where id = p_draft_id
    and status = 'draft';
end;
$$;

revoke all on function public.delete_admin_checkout_draft(uuid) from public, anon;
grant execute on function public.delete_admin_checkout_draft(uuid) to authenticated;
