import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { currentUser } from '../data/mockData';

export const MyProfile: React.FC = () => {
  const [prefRegistration, setPrefRegistration] = useState(true);
  const [prefReminders, setPrefReminders] = useState(true);
  const [prefAnnouncements, setPrefAnnouncements] = useState(true);

  return (
    <AppLayout>
      {/* Title */}
      <div className="flex flex-col gap-xs max-w-[1040px] w-full mx-auto">
        <h1 className="font-headline text-headline-lg text-light-on-surface font-bold">
          Student Profile
        </h1>
        <p className="font-body text-body-md text-light-on-surface-variant">
          Verified academic credentials, hardware device binding, and communication settings.
        </p>
      </div>

      <div className="max-w-[1040px] w-full mx-auto flex flex-col gap-xl">
        {/* Section 1: Student Identity Card */}
        <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-lg shadow-sm">
          <div className="flex items-center justify-between border-b border-light-outline-variant pb-md">
            <h2 className="font-headline text-title-lg font-bold text-light-on-surface m-0">
              Verified University Identity
            </h2>
            <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-success-container text-success font-label text-label-sm font-semibold">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Roster Verified
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-lg">
            <div className="w-20 h-20 rounded-full bg-light-primary text-light-on-primary flex items-center justify-center font-headline text-headline-md font-bold shrink-0 shadow-md">
              {currentUser.avatar_initials}
            </div>

            <div className="flex flex-col gap-xs flex-1">
              <div className="flex flex-wrap items-baseline gap-sm">
                <h3 className="font-headline text-headline-sm font-bold text-light-on-surface m-0">
                  {currentUser.name}
                </h3>
                <span className="font-mono text-mono-md text-light-secondary font-semibold">
                  {currentUser.student_id}
                </span>
              </div>
              <span className="font-body text-body-md text-light-on-surface-variant">
                {currentUser.degree} · {currentUser.faculty}
              </span>
              <span className="font-mono text-label-sm text-light-on-surface-variant">
                {currentUser.email}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-xs border-t border-light-outline-variant pt-md">
            <span className="font-label text-label-sm text-light-on-surface-variant font-medium">
              Active Campus Roles
            </span>
            <div className="flex flex-wrap gap-xs">
              {currentUser.roles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-md py-xs rounded-full bg-light-surface-container-low text-light-on-surface text-label-sm font-label font-medium border border-light-outline-variant/60"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Registered Device */}
        <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col md:flex-row md:items-center justify-between gap-lg shadow-sm">
          <div className="flex items-start gap-md">
            <div className="w-12 h-12 rounded-lg bg-light-surface-container-low text-light-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">smartphone</span>
            </div>
            <div className="flex flex-col gap-xs">
              <span className="font-headline text-title-md font-bold text-light-on-surface">
                {currentUser.registered_device.name}
              </span>
              <span className="font-body text-label-sm text-light-on-surface-variant">
                Registered on {currentUser.registered_device.registered_date} · Active: {currentUser.registered_device.last_active}
              </span>
              <span className="font-body text-xs text-light-outline">
                Attendance QR scanning is restricted to this hardware device for tamper prevention.
              </span>
            </div>
          </div>

          <button
            onClick={() => alert('Device transfer request sent to university IT helpdesk.')}
            className="px-md py-xs rounded bg-light-surface-container-low text-light-primary border border-light-outline-variant font-label text-label-md font-semibold hover:bg-light-surface-container cursor-pointer shrink-0"
          >
            Request Device Transfer
          </button>
        </section>

        {/* Section 3: Notification Preferences */}
        <section className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
          <h2 className="font-headline text-title-lg font-bold text-light-on-surface m-0">
            Notification Preferences
          </h2>

          <div className="flex flex-col divide-y divide-light-outline-variant">
            <label className="py-md flex items-center justify-between cursor-pointer first:pt-0">
              <div className="flex flex-col">
                <span className="font-title text-title-md font-semibold text-light-on-surface">
                  Registration &amp; Payment Updates
                </span>
                <span className="font-body text-body-md text-light-on-surface-variant">
                  Receive instant alerts for approval status changes and seat hold countdowns.
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefRegistration}
                onChange={(e) => setPrefRegistration(e.target.checked)}
                className="w-5 h-5 text-light-primary rounded"
              />
            </label>

            <label className="py-md flex items-center justify-between cursor-pointer">
              <div className="flex flex-col">
                <span className="font-title text-title-md font-semibold text-light-on-surface">
                  Event Check-in Reminders
                </span>
                <span className="font-body text-body-md text-light-on-surface-variant">
                  Push notifications 2 hours before scheduled event door opening times.
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefReminders}
                onChange={(e) => setPrefReminders(e.target.checked)}
                className="w-5 h-5 text-light-primary rounded"
              />
            </label>

            <label className="py-md flex items-center justify-between cursor-pointer">
              <div className="flex flex-col">
                <span className="font-title text-title-md font-semibold text-light-on-surface">
                  Club Bulletins &amp; General Announcements
                </span>
                <span className="font-body text-body-md text-light-on-surface-variant">
                  Weekly digests of volunteer calls and newly scheduled campus activities.
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefAnnouncements}
                onChange={(e) => setPrefAnnouncements(e.target.checked)}
                className="w-5 h-5 text-light-primary rounded"
              />
            </label>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default MyProfile;
