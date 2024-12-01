import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Hero } from './components/home/Hero';
import { Features } from './components/home/Features';
import { Testimonials } from './components/home/Testimonials';
import { Footer } from './components/layout/Footer';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { AddSubscription } from './pages/AddSubscription';
import { EditSubscription } from './pages/EditSubscription';
import { SubscriptionDetail } from './pages/SubscriptionDetail';
import { Settings } from './pages/Settings';
import { VerifyEmail } from './pages/VerifyEmail';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { BudgetProvider } from './contexts/BudgetContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ReviewScheduleProvider } from './contexts/ReviewScheduleContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { SubscriptionList } from './pages/SubscriptionList';
import { Budget } from './pages/Budget';
import { Categories } from './pages/Categories';
import { useNotificationSystem } from './hooks/useNotificationSystem';

function NotificationWrapper({ children }: { children: React.ReactNode }) {
  useNotificationSystem();
  return <>{children}</>;
}

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          <BudgetProvider>
            <NotificationProvider>
              <ReviewScheduleProvider>
                <SettingsProvider>
                  <NotificationWrapper>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/verify-email" element={<VerifyEmail />} />
                      <Route path="/dashboard" element={
                        <PrivateRoute>
                          <Dashboard />
                        </PrivateRoute>
                      } />
                      <Route path="/subscriptions" element={
                        <PrivateRoute>
                          <SubscriptionList />
                        </PrivateRoute>
                      } />
                      <Route path="/budget" element={
                        <PrivateRoute>
                          <Budget />
                        </PrivateRoute>
                      } />
                      <Route path="/categories" element={
                        <PrivateRoute>
                          <Categories />
                        </PrivateRoute>
                      } />
                      <Route path="/settings" element={
                        <PrivateRoute>
                          <Settings />
                        </PrivateRoute>
                      } />
                      <Route path="/add-subscription" element={
                        <PrivateRoute>
                          <AddSubscription />
                        </PrivateRoute>
                      } />
                      <Route path="/edit-subscription/:id" element={
                        <PrivateRoute>
                          <EditSubscription />
                        </PrivateRoute>
                      } />
                      <Route path="/subscription/:id" element={
                        <PrivateRoute>
                          <SubscriptionDetail />
                        </PrivateRoute>
                      } />
                    </Routes>
                  </NotificationWrapper>
                </SettingsProvider>
              </ReviewScheduleProvider>
            </NotificationProvider>
          </BudgetProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
}