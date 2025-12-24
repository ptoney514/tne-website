import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  GradeBadge,
  PaymentBadge,
  StatusBadge,
  CertBadge,
  FilterPill,
  QuickFilterGroup,
  GRADE_BADGE_STYLES,
  PAYMENT_STYLES,
  STATUS_STYLES,
  CERT_STYLES,
} from '../../components/admin/AdminBadges';

describe('GradeBadge', () => {
  it('renders with correct grade', () => {
    render(<GradeBadge grade="5th" />);
    const badge = screen.getByTestId('grade-badge');
    expect(badge).toHaveTextContent('5th');
    expect(badge).toHaveAttribute('data-grade', '5th');
  });

  it('renders nothing when grade is null', () => {
    const { container } = render(<GradeBadge grade={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('normalizes grade string correctly', () => {
    render(<GradeBadge grade="5th Grade" />);
    const badge = screen.getByTestId('grade-badge');
    expect(badge).toHaveAttribute('data-grade', '5th');
  });

  it('applies small size correctly', () => {
    render(<GradeBadge grade="5th" size="sm" />);
    const badge = screen.getByTestId('grade-badge');
    expect(badge.className).toContain('text-[10px]');
  });

  it('applies medium size by default', () => {
    render(<GradeBadge grade="5th" />);
    const badge = screen.getByTestId('grade-badge');
    expect(badge.className).toContain('text-xs');
  });

  it.each(['3rd', '4th', '5th', '6th', '7th', '8th', 'HS'])('renders %s grade with correct styles', (grade) => {
    render(<GradeBadge grade={grade} />);
    const badge = screen.getByTestId('grade-badge');
    const style = GRADE_BADGE_STYLES[grade];
    expect(badge.className).toContain(style.bg);
    expect(badge.className).toContain(style.text);
  });
});

describe('PaymentBadge', () => {
  it('renders with correct status label', () => {
    render(<PaymentBadge status="paid" />);
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it.each([
    ['paid', 'Paid'],
    ['unpaid', 'Unpaid'],
    ['pending', 'Unpaid'],
    ['partial', 'Partial'],
    ['waived', 'Waived'],
  ])('renders %s status with label %s', (status, label) => {
    render(<PaymentBadge status={status} />);
    const badge = screen.getByTestId('payment-badge');
    expect(badge).toHaveTextContent(label);
    expect(badge).toHaveAttribute('data-status', status);
  });

  it('shows dot indicator by default', () => {
    render(<PaymentBadge status="paid" />);
    const badge = screen.getByTestId('payment-badge');
    const dot = badge.querySelector('.rounded-full');
    expect(dot).toBeInTheDocument();
  });

  it('hides dot indicator when showDot is false', () => {
    render(<PaymentBadge status="paid" showDot={false} />);
    const badge = screen.getByTestId('payment-badge');
    const dots = badge.querySelectorAll('.w-1\\.5');
    expect(dots.length).toBe(0);
  });
});

describe('StatusBadge', () => {
  it('renders with correct status label', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it.each([
    ['active', 'Active'],
    ['inactive', 'Inactive'],
    ['pending', 'Pending'],
    ['needs_team', 'Needs Team'],
  ])('renders %s status with label %s', (status, label) => {
    render(<StatusBadge status={status} />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent(label);
    expect(badge).toHaveAttribute('data-status', status);
  });

  it('defaults to inactive for unknown status', () => {
    render(<StatusBadge status="unknown" />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
});

describe('CertBadge', () => {
  it('renders with correct label', () => {
    render(<CertBadge label="USA" hasIt={true} />);
    expect(screen.getByText('USA')).toBeInTheDocument();
  });

  it('shows valid status when has certification', () => {
    render(<CertBadge label="CPR" hasIt={true} />);
    const badge = screen.getByTestId('cert-badge');
    expect(badge).toHaveAttribute('data-status', 'valid');
  });

  it('shows missing status when missing certification', () => {
    render(<CertBadge label="BG" hasIt={false} />);
    const badge = screen.getByTestId('cert-badge');
    expect(badge).toHaveAttribute('data-status', 'missing');
    expect(badge.className).toContain('border-dashed');
  });

  it('shows expiring status when expiration is within 30 days', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 15);
    render(<CertBadge label="USA" hasIt={true} expiresAt={soon} />);
    const badge = screen.getByTestId('cert-badge');
    expect(badge).toHaveAttribute('data-status', 'expiring');
    expect(badge.className).toContain('bg-amber-100');
  });

  it('shows expired status when expiration is past', () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    render(<CertBadge label="CPR" hasIt={true} expiresAt={past} />);
    const badge = screen.getByTestId('cert-badge');
    expect(badge).toHaveAttribute('data-status', 'expired');
    expect(badge.className).toContain('bg-red-100');
  });

  it('shows valid status when expiration is more than 30 days away', () => {
    const future = new Date();
    future.setDate(future.getDate() + 60);
    render(<CertBadge label="BG" hasIt={true} expiresAt={future} />);
    const badge = screen.getByTestId('cert-badge');
    expect(badge).toHaveAttribute('data-status', 'valid');
    expect(badge.className).toContain('bg-emerald-100');
  });
});

describe('FilterPill', () => {
  it('renders with children', () => {
    render(<FilterPill onClick={() => {}}>Test Filter</FilterPill>);
    expect(screen.getByText('Test Filter')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<FilterPill onClick={handleClick}>Click Me</FilterPill>);
    fireEvent.click(screen.getByTestId('filter-pill'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows count when provided', () => {
    render(<FilterPill onClick={() => {}} count={5}>With Count</FilterPill>);
    expect(screen.getByText('(5)')).toBeInTheDocument();
  });

  it('shows icon when provided', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    render(<FilterPill onClick={() => {}} icon={<TestIcon />}>With Icon</FilterPill>);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('applies active state styling', () => {
    render(<FilterPill onClick={() => {}} active={true}>Active</FilterPill>);
    const pill = screen.getByTestId('filter-pill');
    expect(pill).toHaveAttribute('data-active', 'true');
    expect(pill.className).toContain('ring-2');
  });

  it('does not apply active styling when inactive', () => {
    render(<FilterPill onClick={() => {}} active={false}>Inactive</FilterPill>);
    const pill = screen.getByTestId('filter-pill');
    expect(pill).toHaveAttribute('data-active', 'false');
    expect(pill.className).not.toContain('ring-2');
  });

  it.each(['default', 'warning', 'error', 'success'])('applies %s variant styling', (variant) => {
    render(<FilterPill onClick={() => {}} variant={variant}>Variant</FilterPill>);
    const pill = screen.getByTestId('filter-pill');
    expect(pill).toHaveAttribute('data-variant', variant);
  });
});

describe('QuickFilterGroup', () => {
  it('renders label and children', () => {
    render(
      <QuickFilterGroup label="Status">
        <FilterPill onClick={() => {}}>Active</FilterPill>
      </QuickFilterGroup>
    );
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

describe('Style constants', () => {
  it('GRADE_BADGE_STYLES has all expected grades', () => {
    const expectedGrades = ['3rd', '4th', '5th', '6th', '7th', '8th', 'HS'];
    expectedGrades.forEach((grade) => {
      expect(GRADE_BADGE_STYLES[grade]).toBeDefined();
      expect(GRADE_BADGE_STYLES[grade].bg).toBeDefined();
      expect(GRADE_BADGE_STYLES[grade].text).toBeDefined();
    });
  });

  it('PAYMENT_STYLES has all expected statuses', () => {
    const expectedStatuses = ['paid', 'unpaid', 'pending', 'partial', 'waived'];
    expectedStatuses.forEach((status) => {
      expect(PAYMENT_STYLES[status]).toBeDefined();
      expect(PAYMENT_STYLES[status].label).toBeDefined();
    });
  });

  it('STATUS_STYLES has all expected statuses', () => {
    const expectedStatuses = ['active', 'inactive', 'pending', 'needs_team'];
    expectedStatuses.forEach((status) => {
      expect(STATUS_STYLES[status]).toBeDefined();
    });
  });

  it('CERT_STYLES has all expected statuses', () => {
    const expectedStatuses = ['valid', 'expiring', 'expired', 'missing'];
    expectedStatuses.forEach((status) => {
      expect(CERT_STYLES[status]).toBeDefined();
      expect(CERT_STYLES[status].border).toBeDefined();
    });
  });
});
