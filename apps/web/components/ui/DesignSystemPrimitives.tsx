import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import Link from 'next/link';
import { primitiveClasses } from '@pridicta/ui-tokens';

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}

export function PredictaPageShell({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<'main'>) {
  return (
    <main className={joinClassNames(primitiveClasses.pageShell, className)} {...props}>
      {children}
    </main>
  );
}

export function PredictaSectionStack({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<'section'>) {
  return (
    <section className={joinClassNames(primitiveClasses.sectionStack, className)} {...props}>
      {children}
    </section>
  );
}

export function PredictaCard({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<'section'>) {
  return (
    <section className={joinClassNames(primitiveClasses.card, 'glass-panel', className)} {...props}>
      {children}
    </section>
  );
}

export function PredictaPanel({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<'section'>) {
  return (
    <section className={joinClassNames(primitiveClasses.panel, 'glass-panel', className)} {...props}>
      {children}
    </section>
  );
}

type PredictaButtonBaseProps = {
  children: ReactNode;
  className?: string;
  error?: boolean;
  loading?: boolean;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

type PredictaButtonProps =
  | (PredictaButtonBaseProps &
      ComponentPropsWithoutRef<'button'> & {
        href?: never;
      })
  | (PredictaButtonBaseProps &
      Omit<ComponentPropsWithoutRef<typeof Link>, 'href'> & {
        disabled?: boolean;
        href: string;
      });

export function PredictaButton(props: PredictaButtonProps) {
  const {
    children,
    className,
    error = false,
    loading = false,
    selected = false,
    size = 'md',
    variant = 'secondary',
    ...rest
  } = props;
  const classes = joinClassNames(
    primitiveClasses.button,
    `predicta-button--${variant}`,
    `predicta-button--${size}`,
    selected ? 'is-selected' : undefined,
    loading ? 'is-loading' : undefined,
    error ? 'is-error' : undefined,
    className,
  );

  if ('href' in rest && rest.href) {
    const { disabled, href, ...linkProps } = rest;

    if (disabled) {
      return (
        <span aria-disabled="true" className={joinClassNames(classes, 'is-disabled')} role="link">
          {children}
        </span>
      );
    }

    return (
      <Link className={classes} href={href} {...linkProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as ComponentPropsWithoutRef<'button'>;

  return (
    <button
      {...buttonProps}
      className={classes}
      data-loading={loading ? 'true' : undefined}
      disabled={buttonProps.disabled || loading}
      type={buttonProps.type ?? 'button'}
    >
      {children}
    </button>
  );
}

export function PredictaActionRow({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={joinClassNames(primitiveClasses.actionRow, className)} {...props}>
      {children}
    </div>
  );
}

export function PredictaPill({
  children,
  className,
  selected,
  ...props
}: {
  children: ReactNode;
  className?: string;
  selected?: boolean;
} & ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      className={joinClassNames(primitiveClasses.pill, selected ? 'is-selected' : undefined, className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function PredictaBadge({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<'span'>) {
  return (
    <span className={joinClassNames(primitiveClasses.badge, className)} {...props}>
      {children}
    </span>
  );
}

export function PredictaInput({
  className,
  error,
  ...props
}: { className?: string; error?: boolean } & ComponentPropsWithoutRef<'input'>) {
  return (
    <input
      className={joinClassNames(primitiveClasses.input, error ? 'is-error' : undefined, className)}
      {...props}
    />
  );
}

export function PredictaSelect({
  children,
  className,
  error,
  ...props
}: {
  children: ReactNode;
  className?: string;
  error?: boolean;
} & ComponentPropsWithoutRef<'select'>) {
  return (
    <select
      className={joinClassNames(primitiveClasses.select, error ? 'is-error' : undefined, className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function PredictaTabs({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<'nav'>) {
  return (
    <nav className={joinClassNames(primitiveClasses.tabs, className)} {...props}>
      {children}
    </nav>
  );
}

export function PredictaTable({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={joinClassNames(primitiveClasses.table, className)} {...props}>
      {children}
    </div>
  );
}

export function PredictaForm({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<'form'>) {
  return (
    <form className={joinClassNames(primitiveClasses.form, className)} {...props}>
      {children}
    </form>
  );
}

export function PredictaEmptyState({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<'section'>) {
  return (
    <section className={joinClassNames(primitiveClasses.emptyState, className)} {...props}>
      {children}
    </section>
  );
}

export function PredictaLoadingState({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<'section'>) {
  return (
    <section className={joinClassNames(primitiveClasses.loadingState, className)} {...props}>
      {children}
    </section>
  );
}

export function PredictaModal({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<'section'>) {
  return (
    <section className={joinClassNames(primitiveClasses.modal, 'glass-panel', className)} {...props}>
      {children}
    </section>
  );
}

export function PredictaDrawer({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<'aside'>) {
  return (
    <aside className={joinClassNames(primitiveClasses.drawer, 'glass-panel', className)} {...props}>
      {children}
    </aside>
  );
}

export function PredictaStateBanner({
  children,
  className,
  status = 'info',
  ...props
}: {
  children: ReactNode;
  className?: string;
  status?: 'info' | 'success' | 'warning' | 'error';
} & ComponentPropsWithoutRef<'section'>) {
  return (
    <section
      className={joinClassNames(primitiveClasses.stateBanner, `is-${status}`, className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function PredictaStickyCta({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<'aside'>) {
  return (
    <aside className={joinClassNames(primitiveClasses.stickyCta, className)} {...props}>
      {children}
    </aside>
  );
}

export function PredictaStickyAction({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<'aside'>) {
  return (
    <aside
      className={joinClassNames(
        primitiveClasses.stickyAction,
        primitiveClasses.stickyCta,
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}
