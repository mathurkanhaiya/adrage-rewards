import { Gift, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useEffect, useState } from 'react';
import { getTasks } from '@/lib/api';
import type { Task } from '@/lib/types';
import { toast } from 'sonner';

export default function TasksPage() {
  const { user, loading: userLoading } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasks()
      .then((data) => setTasks(data.tasks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-4 space-y-4 max-w-md mx-auto">
      <div>
        <h1 className="text-lg font-display font-bold text-gold tracking-wider">TASKS</h1>
        <p className="text-xs text-muted-foreground">Complete tasks to earn rewards</p>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-card-gradient rounded-xl border border-border p-8 text-center">
          <Gift size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No tasks available right now</p>
          <p className="text-xs text-muted-foreground mt-1">Check back later!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-card-gradient rounded-xl border border-border p-4 flex items-center gap-3 shadow-card"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Gift size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                )}
                <p className="text-xs text-gold font-display mt-0.5">
                  +{task.reward_amount} {task.reward_currency}
                </p>
              </div>
              {task.url && (
                <a
                  href={task.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-primary/10 text-primary rounded-lg px-3 py-1.5 text-xs font-display tracking-wider hover:bg-primary/20 transition-colors"
                >
                  GO <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
