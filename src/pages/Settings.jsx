import { useState } from 'react';
import { useProfile } from '../features/auth/useAuth';
import { useUi } from '../stores/ui';
import { Button } from '../components/ui/Controls';
import { Tabs } from '../components/ui/Tabs';
import styles from './Workspace.module.css';

export function Component() {
  const { data: user } = useProfile();
  const theme = useUi((state) => state.theme);
  const setTheme = useUi((state) => state.setTheme);
  const [tab, setTab] = useState('profile');
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.eyebrow}>YOUR WORKSPACE</div>
          <h1>Settings</h1>
          <p>A workspace that feels like yours.</p>
        </div>
      </div>
      <section className={styles.settings}>
        <Tabs
          label="Settings"
          value={tab}
          onChange={setTab}
          items={[
            {
              value: 'profile',
              label: 'Profile',
              content: (
                <>
                  <h2>Your profile</h2>
                  <div className={styles.settingRow}>
                    Name<span>{user?.name}</span>
                  </div>
                  <div className={styles.settingRow}>
                    Email<span>{user?.email}</span>
                  </div>
                  <div className={styles.settingRow}>
                    Joined
                    <span>
                      {user?.created_at
                        ? new Intl.DateTimeFormat('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            dateStyle: 'medium',
                          }).format(new Date(user.created_at))
                        : 'Unavailable'}
                    </span>
                  </div>
                  <p>Profile information is read-only.</p>
                </>
              ),
            },
            {
              value: 'appearance',
              label: 'Appearance',
              content: (
                <>
                  <h2>Choose your theme</h2>
                  <p>
                    Make the workspace comfortable for you. Theme preferences last for this browser
                    visit.
                  </p>
                  <div className={styles.themeOptions}>
                    {['dark', 'light'].map((option) => (
                      <Button
                        key={option}
                        variant="secondary"
                        aria-pressed={theme === option}
                        onClick={() => setTheme(option)}
                      >
                        {option === 'dark' ? 'Dark' : 'Light'}
                      </Button>
                    ))}
                  </div>
                </>
              ),
            },
            {
              value: 'regional',
              label: 'Region',
              content: (
                <>
                  <h2>Regional defaults</h2>
                  <div className={styles.settingRow}>
                    Currency<span>INR · Indian rupee</span>
                  </div>
                  <div className={styles.settingRow}>
                    Timezone<span>Asia/Kolkata</span>
                  </div>
                  <div className={styles.settingRow}>
                    Locale<span>en-IN</span>
                  </div>
                </>
              ),
            },
          ]}
        />
      </section>
    </>
  );
}
