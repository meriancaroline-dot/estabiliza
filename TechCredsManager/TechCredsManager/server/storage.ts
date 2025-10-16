// Blueprint: javascript_database + javascript_log_in_with_replit
import { 
  users, 
  moodEntries, 
  reminders, 
  habits, 
  messages, 
  professionals, 
  listeningSpaceBookings, 
  educationalResources, 
  badges, 
  userBadges,
  type User, 
  type UpsertUser,
  type MoodEntry,
  type InsertMoodEntry,
  type Reminder,
  type InsertReminder,
  type Habit,
  type InsertHabit,
  type Message,
  type InsertMessage,
  type Professional,
  type InsertProfessional,
  type ListeningSpaceBooking,
  type InsertListeningBooking,
  type EducationalResource,
  type InsertEducationalResource,
  type Badge,
  type InsertBadge,
  type UserBadge,
  type InsertUserBadge,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte } from "drizzle-orm";
import { subDays } from "date-fns";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Mood operations
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  getMoodEntries(userId: string): Promise<MoodEntry[]>;
  getRecentMoodEntries(userId: string, days?: number): Promise<MoodEntry[]>;
  
  // Reminder operations
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  getReminders(userId: string): Promise<Reminder[]>;
  completeReminder(id: string, userId: string): Promise<Reminder>;
  deleteReminder(id: string, userId: string): Promise<void>;
  
  // Habit operations
  createHabit(habit: InsertHabit): Promise<Habit>;
  getHabits(userId: string): Promise<Habit[]>;
  completeHabit(id: string, userId: string): Promise<Habit>;
  deleteHabit(id: string, userId: string): Promise<void>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(userId: string): Promise<Message[]>;
  
  // Professional operations
  getProfessionals(): Promise<Professional[]>;
  
  // Listening Space operations
  createListeningBooking(booking: InsertListeningBooking): Promise<ListeningSpaceBooking>;
  getListeningBookings(userId: string): Promise<ListeningSpaceBooking[]>;
  
  // Educational Resources operations
  getEducationalResources(): Promise<EducationalResource[]>;
  
  // Badge operations
  getBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<UserBadge[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Mood operations
  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const [moodEntry] = await db.insert(moodEntries).values(entry).returning();
    return moodEntry;
  }

  async getMoodEntries(userId: string): Promise<MoodEntry[]> {
    return db.select().from(moodEntries).where(eq(moodEntries.userId, userId)).orderBy(desc(moodEntries.createdAt));
  }

  async getRecentMoodEntries(userId: string, days: number = 7): Promise<MoodEntry[]> {
    const cutoffDate = subDays(new Date(), days);
    return db.select().from(moodEntries)
      .where(and(eq(moodEntries.userId, userId), gte(moodEntries.createdAt, cutoffDate)))
      .orderBy(desc(moodEntries.createdAt));
  }

  // Reminder operations
  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const [newReminder] = await db.insert(reminders).values(reminder).returning();
    return newReminder;
  }

  async getReminders(userId: string): Promise<Reminder[]> {
    return db.select().from(reminders).where(eq(reminders.userId, userId)).orderBy(desc(reminders.scheduledTime));
  }

  async completeReminder(id: string, userId: string): Promise<Reminder> {
    const [updated] = await db.update(reminders)
      .set({ isCompleted: true })
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();
    if (!updated) throw new Error("Reminder not found or unauthorized");
    return updated;
  }

  async deleteReminder(id: string, userId: string): Promise<void> {
    const result = await db.delete(reminders).where(and(eq(reminders.id, id), eq(reminders.userId, userId))).returning();
    if (!result.length) throw new Error("Reminder not found or unauthorized");
  }

  // Habit operations
  async createHabit(habit: InsertHabit): Promise<Habit> {
    const [newHabit] = await db.insert(habits).values(habit).returning();
    return newHabit;
  }

  async getHabits(userId: string): Promise<Habit[]> {
    return db.select().from(habits).where(eq(habits.userId, userId)).orderBy(desc(habits.createdAt));
  }

  async completeHabit(id: string, userId: string): Promise<Habit> {
    const [habit] = await db.select().from(habits).where(and(eq(habits.id, id), eq(habits.userId, userId)));
    if (!habit) throw new Error("Habit not found or unauthorized");

    const newStreak = (habit.currentStreak || 0) + 1;
    const longestStreak = Math.max(habit.longestStreak || 0, newStreak);

    const [updated] = await db.update(habits)
      .set({
        currentStreak: newStreak,
        longestStreak,
        lastCompletedAt: new Date(),
      })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();
    return updated;
  }

  async deleteHabit(id: string, userId: string): Promise<void> {
    const result = await db.delete(habits).where(and(eq(habits.id, id), eq(habits.userId, userId))).returning();
    if (!result.length) throw new Error("Habit not found or unauthorized");
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessages(userId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.userId, userId)).orderBy(messages.createdAt);
  }

  // Professional operations
  async getProfessionals(): Promise<Professional[]> {
    return db.select().from(professionals).where(eq(professionals.isActive, true));
  }

  // Listening Space operations
  async createListeningBooking(booking: InsertListeningBooking): Promise<ListeningSpaceBooking> {
    const [newBooking] = await db.insert(listeningSpaceBookings).values(booking).returning();
    return newBooking;
  }

  async getListeningBookings(userId: string): Promise<ListeningSpaceBooking[]> {
    return db.select().from(listeningSpaceBookings)
      .where(eq(listeningSpaceBookings.userId, userId))
      .orderBy(desc(listeningSpaceBookings.scheduledAt));
  }

  // Educational Resources operations
  async getEducationalResources(): Promise<EducationalResource[]> {
    return db.select().from(educationalResources).where(eq(educationalResources.isActive, true));
  }

  // Badge operations
  async getBadges(): Promise<Badge[]> {
    return db.select().from(badges);
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return db.select().from(userBadges).where(eq(userBadges.userId, userId));
  }
}

export const storage = new DatabaseStorage();
