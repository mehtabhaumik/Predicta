import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { SkeletonCard, SkeletonLine, SkeletonStack } from '../src/components/Skeleton';

describe('mobile skeleton loading components', () => {
  it('renders a glass skeleton card with requested rows', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<SkeletonCard rows={3} />);
    });

    expect(tree?.toJSON()).toBeTruthy();
  });

  it('renders line and stacked placeholders without requiring data', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <>
          <SkeletonLine width="64%" />
          <SkeletonStack rows={2} />
        </>,
      );
    });

    expect(tree?.toJSON()).toBeTruthy();
  });
});
