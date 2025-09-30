# Rojifi Preloader System

A comprehensive preloader system for the Rojifi application with multiple variants and easy-to-use hooks.

## Components

### 1. Main Preloader (`preloader.tsx`)
The main preloader component with Rojifi branding and animations.

**Features:**
- Animated Rojifi logo with smooth scaling and rotation
- Gradient background with dark mode support
- Customizable loading message
- Optional progress bar
- Animated loading dots
- Security badge
- Slower, more elegant animations (2.2s duration)

**Usage:**
```tsx
import Preloader from "@/v1/components/preloader";

// Basic usage
<Preloader message="Loading your dashboard..." />

// With progress bar
<Preloader 
  message="Processing transaction..." 
  showProgress={true} 
  progress={75} 
/>
```

### 2. Preloader Variants (`preloader-variants.tsx`)
Multiple preloader variants for different use cases.

**Variants:**
- `default` - Full-featured preloader with branding
- `minimal` - Simple spinning loader
- `success` - Success state with checkmark
- `error` - Error state with alert icon

**Usage:**
```tsx
import { PreloaderVariant, MinimalPreloader, SuccessPreloader } from "@/v1/components/preloader-variants";

// Using variants
<PreloaderVariant variant="minimal" message="Loading..." size="sm" />
<MinimalPreloader message="Quick loading..." />
<SuccessPreloader message="Operation completed!" />
```

### 3. Preloader Hook (`usePreloader.tsx`)
A React hook for managing preloader states programmatically.

**Features:**
- Show/hide preloader
- Update progress and messages
- Simulate loading with progress
- Promise-based loading simulation

**Usage:**
```tsx
import { usePreloader } from "@/v1/hooks/usePreloader";

function MyComponent() {
  const { 
    preloaderState, 
    showPreloader, 
    hidePreloader, 
    updateProgress, 
    simulateLoading 
  } = usePreloader();

  const handleAsyncOperation = async () => {
    await simulateLoading(3000, "Processing your request...");
    // Operation completed
  };

  if (preloaderState.isLoading) {
    return <Preloader {...preloaderState} />;
  }

  return <div>Your content</div>;
}
```

### 4. Demo Component (`preloader-demo.tsx`)
A demonstration component for testing preloader functionality.

## Integration Points

### 1. ProtectedRoute Integration
The `ProtectedRoute` component now shows a preloader while checking authentication:

```tsx
// In ProtectedRoute.tsx
if (isLoading) {
  return <Preloader message="Authenticating your session..." />;
}
```

### 2. AppRoute Integration
The `AppRoute` component shows a preloader while checking verification status:

```tsx
// In App.tsx
if (isLoading) {
  return (
    <Route path={path}>
      {() => <Preloader message="Checking verification status..." />}
    </Route>
  );
}
```

## Customization

### Styling
The preloader uses Tailwind CSS classes and can be customized by modifying the component files:

- **Colors**: Modify gradient classes (`from-blue-600 to-purple-600`)
- **Animations**: Adjust Framer Motion animation properties
- **Sizes**: Change icon and container sizes
- **Messages**: Customize loading messages

### Timing
Default loading times:
- Authentication check: 800ms
- Verification check: 600ms
- Custom operations: Configurable

### Branding
The preloader includes:
- Official Rojifi logo with smooth animations
- Gradient color scheme matching brand colors
- Security badge
- Elegant animated elements with slower timing

## Best Practices

1. **Use appropriate preloaders**:
   - Full preloader for major route changes
   - Minimal preloader for quick operations
   - Success/error variants for feedback

2. **Set realistic loading times**:
   - Too short: Jarring user experience
   - Too long: User frustration
   - Recommended: 500-1000ms for most operations

3. **Provide meaningful messages**:
   - Be specific about what's loading
   - Use action-oriented language
   - Update messages for long operations

4. **Handle errors gracefully**:
   - Show error preloader for failed operations
   - Provide retry mechanisms
   - Clear error states appropriately

## Examples

### Basic Route Protection
```tsx
// Automatically handled by ProtectedRoute
<ProtectedRoute path="/dashboard/:wallet">
  <DashboardContent />
</ProtectedRoute>
```

### Custom Loading States
```tsx
const { showPreloader, hidePreloader, updateProgress } = usePreloader();

const handleFileUpload = async (file) => {
  showPreloader("Uploading file...", true);
  
  // Simulate upload progress
  for (let i = 0; i <= 100; i += 10) {
    updateProgress(i);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  hidePreloader();
};
```

### Success Feedback
```tsx
const handleSuccess = () => {
  showPreloader("Operation completed successfully!", false);
  setTimeout(() => hidePreloader(), 2000);
};
```

## Performance Considerations

- Preloaders use CSS transforms and opacity for smooth animations
- Framer Motion provides optimized animations
- Components are lightweight and don't impact bundle size significantly
- Loading states prevent unnecessary re-renders

## Accessibility

- Preloaders include proper ARIA labels
- Screen readers can announce loading states
- High contrast support for dark/light modes
- Keyboard navigation friendly

## Testing

Use the `PreloaderDemo` component to test different scenarios:

```tsx
import PreloaderDemo from "@/v1/components/preloader-demo";

// Add to your test routes
<Route path="/preloader-demo">
  <PreloaderDemo />
</Route>
```

This comprehensive preloader system enhances the user experience by providing visual feedback during loading states while maintaining the Rojifi brand identity.
