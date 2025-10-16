// Blueprint: javascript_log_in_with_replit + javascript_database
import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  integer, 
  boolean,
  index,
  jsonb
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============== AUTH TABLES (from blueprint) ==============

// Session storage table (IMPORTANT: mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (IMPORTANT: mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  themePreference: varchar("theme_preference").default("light"), // light | dark | system
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  moodEntries: many(moodEntries),
  reminders: many(reminders),
  habits: many(habits),
  messages: many(messages),
  listeningBookings: many(listeningSpaceBookings),
  userBadges: many(userBadges),
}));

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ============== MOOD TRACKING ==============

export const moodEntries = pgTable("mood_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mood: integer("mood").notNull(), // 1=very sad 😢, 2=sad 😟, 3=neutral 😐, 4=happy 🙂, 5=very happy 😊
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const moodEntriesRelations = relations(moodEntries, ({ one }) => ({
  user: one(users, {
    fields: [moodEntries.userId],
    references: [users.id],
  }),
}));

export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  createdAt: true,
});

export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;

// ============== REMINDERS ==============

export const reminders = pgTable("reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  scheduledTime: timestamp("scheduled_time").notNull(),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const remindersRelations = relations(reminders, ({ one }) => ({
  user: one(users, {
    fields: [reminders.userId],
    references: [users.id],
  }),
}));

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
});

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

// ============== HABITS ==============

export const habits = pgTable("habits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  frequency: varchar("frequency").notNull(), // daily, weekly, custom
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastCompletedAt: timestamp("last_completed_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const habitsRelations = relations(habits, ({ one }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
}));

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  currentStreak: true,
  longestStreak: true,
  lastCompletedAt: true,
  createdAt: true,
});

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

// ============== CHAT / MESSAGES ==============

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  senderType: varchar("sender_type").notNull(), // user | support
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// ============== PROFESSIONALS ==============

export const professionals = pgTable("professionals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // psychologist | psychiatrist | lawyer
  name: varchar("name", { length: 255 }).notNull(),
  specialty: varchar("specialty", { length: 255 }),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProfessionalSchema = createInsertSchema(professionals).omit({
  id: true,
  createdAt: true,
});

export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type Professional = typeof professionals.$inferSelect;

// ============== LISTENING SPACE BOOKINGS ==============

export const listeningSpaceBookings = pgTable("listening_space_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").default(60), // 60 min free for app users
  status: varchar("status").default("scheduled"), // scheduled | completed | cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const listeningSpaceBookingsRelations = relations(listeningSpaceBookings, ({ one }) => ({
  user: one(users, {
    fields: [listeningSpaceBookings.userId],
    references: [users.id],
  }),
}));

export const insertListeningBookingSchema = createInsertSchema(listeningSpaceBookings).omit({
  id: true,
  createdAt: true,
});

export type InsertListeningBooking = z.infer<typeof insertListeningBookingSchema>;
export type ListeningSpaceBooking = typeof listeningSpaceBookings.$inferSelect;

// ============== EDUCATIONAL RESOURCES ==============

export const educationalResources = pgTable("educational_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category").notNull(), // article | video | audio_meditation
  description: text("description"),
  url: text("url"),
  thumbnailUrl: text("thumbnail_url"),
  durationMinutes: integer("duration_minutes"), // for videos/audios
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEducationalResourceSchema = createInsertSchema(educationalResources).omit({
  id: true,
  createdAt: true,
});

export type InsertEducationalResource = z.infer<typeof insertEducationalResourceSchema>;
export type EducationalResource = typeof educationalResources.$inferSelect;

// ============== GAMIFICATION: BADGES ==============

export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 100 }), // emoji or icon name
  triggerType: varchar("trigger_type").notNull(), // mood_streak | habit_streak | first_chat | etc
  triggerValue: integer("trigger_value"), // e.g., 7 for 7-day streak
  createdAt: timestamp("created_at").defaultNow(),
});

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

// ============== USER BADGES (EARNED) ==============

export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: varchar("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
