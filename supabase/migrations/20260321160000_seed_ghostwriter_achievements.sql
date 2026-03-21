insert into public.achievements (slug, title, description, xp_reward)
values
  ('first-words', 'First Words', 'Write your first 100 words in Ghostwriter.', 10),
  ('daily-quota', 'Daily Quota', 'Hit the 1,667-word daily goal.', 25),
  ('five-day-streak', 'Five Day Streak', 'Write for five consecutive days.', 50)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  xp_reward = excluded.xp_reward;
