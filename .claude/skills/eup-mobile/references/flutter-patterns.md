# Flutter Widget Patterns

## Screen Template

```dart
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final metricsAsync = ref.watch(metricsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: metricsAsync.when(
        data: (metrics) => _DashboardContent(metrics: metrics),
        loading: () => const _DashboardSkeleton(),
        error: (error, _) => ErrorView(
          message: 'Failed to load dashboard',
          onRetry: () => ref.invalidate(metricsProvider),
        ),
      ),
    );
  }
}
```

## Pull-to-Refresh List

```dart
class PostListScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postsAsync = ref.watch(postsProvider);

    return RefreshIndicator(
      onRefresh: () => ref.refresh(postsProvider.future),
      child: postsAsync.when(
        data: (posts) => posts.isEmpty
          ? const EmptyState(message: 'No posts yet')
          : ListView.builder(
              itemCount: posts.length,
              itemBuilder: (_, i) => PostCard(post: posts[i]),
            ),
        loading: () => const PostListSkeleton(),
        error: (e, _) => ErrorView(message: e.toString()),
      ),
    );
  }
}
```

## Form with Validation

```dart
class LeadFormWidget extends StatefulWidget {
  @override
  State<LeadFormWidget> createState() => _LeadFormWidgetState();
}

class _LeadFormWidgetState extends State<LeadFormWidget> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _nameController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              labelText: 'Email',
              hintText: 'you@example.com',
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Email is required';
              if (!value.contains('@')) return 'Invalid email';
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Name',
              hintText: 'Your name (optional)',
            ),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _submit,
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      // Call API
    }
  }
}
```

## Bottom Navigation

```dart
class AppShell extends StatelessWidget {
  final Widget child;

  const AppShell({required this.child, super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.article), label: 'Posts'),
          NavigationDestination(icon: Icon(Icons.calendar_month), label: 'Calendar'),
          NavigationDestination(icon: Icon(Icons.settings), label: 'Settings'),
        ],
        selectedIndex: _currentIndex(context),
        onDestinationSelected: (index) => _navigateTo(context, index),
      ),
    );
  }
}
```

## Skeleton Loading

```dart
class PostCardSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(width: 100, height: 12, color: Colors.grey[200]),
            const SizedBox(height: 8),
            Container(width: double.infinity, height: 16, color: Colors.grey[200]),
            const SizedBox(height: 4),
            Container(width: 200, height: 16, color: Colors.grey[200]),
          ],
        ),
      ),
    );
  }
}
```
