// Blueprint: javascript_log_in_with_replit
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertMoodEntrySchema, insertReminderSchema, insertHabitSchema, insertMessageSchema, insertListeningBookingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Mood routes
  app.post('/api/moods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertMoodEntrySchema.parse({ ...req.body, userId });
      const moodEntry = await storage.createMoodEntry(validated);
      res.json(moodEntry);
    } catch (error: any) {
      console.error("Error creating mood entry:", error);
      res.status(400).json({ message: error.message || "Failed to create mood entry" });
    }
  });

  app.get('/api/moods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const moods = await storage.getMoodEntries(userId);
      res.json(moods);
    } catch (error) {
      console.error("Error fetching moods:", error);
      res.status(500).json({ message: "Failed to fetch moods" });
    }
  });

  app.get('/api/moods/recent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const moods = await storage.getRecentMoodEntries(userId, 7);
      res.json(moods);
    } catch (error) {
      console.error("Error fetching recent moods:", error);
      res.status(500).json({ message: "Failed to fetch recent moods" });
    }
  });

  // Reminder routes
  app.post('/api/reminders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertReminderSchema.parse({ ...req.body, userId });
      const reminder = await storage.createReminder(validated);
      res.json(reminder);
    } catch (error: any) {
      console.error("Error creating reminder:", error);
      res.status(400).json({ message: error.message || "Failed to create reminder" });
    }
  });

  app.get('/api/reminders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reminders = await storage.getReminders(userId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.patch('/api/reminders/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const reminder = await storage.completeReminder(id, userId);
      res.json(reminder);
    } catch (error: any) {
      console.error("Error completing reminder:", error);
      if (error.message.includes("not found") || error.message.includes("unauthorized")) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      res.status(500).json({ message: "Failed to complete reminder" });
    }
  });

  app.delete('/api/reminders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      await storage.deleteReminder(id, userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting reminder:", error);
      if (error.message.includes("not found") || error.message.includes("unauthorized")) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });

  // Habit routes
  app.post('/api/habits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertHabitSchema.parse({ ...req.body, userId });
      const habit = await storage.createHabit(validated);
      res.json(habit);
    } catch (error: any) {
      console.error("Error creating habit:", error);
      res.status(400).json({ message: error.message || "Failed to create habit" });
    }
  });

  app.get('/api/habits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habits = await storage.getHabits(userId);
      res.json(habits);
    } catch (error) {
      console.error("Error fetching habits:", error);
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  app.patch('/api/habits/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const habit = await storage.completeHabit(id, userId);
      res.json(habit);
    } catch (error: any) {
      console.error("Error completing habit:", error);
      if (error.message.includes("not found") || error.message.includes("unauthorized")) {
        return res.status(404).json({ message: "Habit not found" });
      }
      res.status(500).json({ message: "Failed to complete habit" });
    }
  });

  app.delete('/api/habits/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      await storage.deleteHabit(id, userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting habit:", error);
      if (error.message.includes("not found") || error.message.includes("unauthorized")) {
        return res.status(404).json({ message: "Habit not found" });
      }
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  // Message routes
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertMessageSchema.parse({ ...req.body, userId });
      const message = await storage.createMessage(validated);
      res.json(message);
    } catch (error: any) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: error.message || "Failed to create message" });
    }
  });

  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Professional routes (public)
  app.get('/api/professionals', async (req, res) => {
    try {
      const professionals = await storage.getProfessionals();
      res.json(professionals);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      res.status(500).json({ message: "Failed to fetch professionals" });
    }
  });

  // Listening Space Booking routes
  app.post('/api/listening-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertListeningBookingSchema.parse({ ...req.body, userId });
      const booking = await storage.createListeningBooking(validated);
      res.json(booking);
    } catch (error: any) {
      console.error("Error creating listening booking:", error);
      res.status(400).json({ message: error.message || "Failed to create booking" });
    }
  });

  app.get('/api/listening-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getListeningBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching listening bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Educational Resources routes (public)
  app.get('/api/resources', async (req, res) => {
    try {
      const resources = await storage.getEducationalResources();
      res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // Badge routes (public)
  app.get('/api/badges', async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // User Badge routes
  app.get('/api/user-badges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
