import type { ComponentPropsWithoutRef, ReactNode } from 'react';
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
