import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditTeamTagsModal } from '@/components/EditTeamTagsModal';

const mockTeam = {
  id: '1',
  name: 'Express United',
  grade_level: '5th',
  tier: 'express',
  tags: ['3ssb'],
};

describe('EditTeamTagsModal', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <EditTeamTagsModal isOpen={false} onClose={() => {}} team={mockTeam} onSave={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render when team is null', () => {
    const { container } = render(
      <EditTeamTagsModal isOpen={true} onClose={() => {}} team={null} onSave={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render modal when open with team', () => {
    render(
      <EditTeamTagsModal isOpen={true} onClose={() => {}} team={mockTeam} onSave={() => {}} />
    );

    expect(screen.getByTestId('edit-tags-modal')).toBeInTheDocument();
    expect(screen.getByText('Edit Team Classification')).toBeInTheDocument();
    expect(screen.getByText('Express United - 5th Grade')).toBeInTheDocument();
  });

  it('should display all tier options', () => {
    render(
      <EditTeamTagsModal isOpen={true} onClose={() => {}} team={mockTeam} onSave={() => {}} />
    );

    expect(screen.getByText('TNE Elite')).toBeInTheDocument();
    expect(screen.getByText('Express United')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
  });

  it('should have correct tier pre-selected', () => {
    render(
      <EditTeamTagsModal isOpen={true} onClose={() => {}} team={mockTeam} onSave={() => {}} />
    );

    const expressRadio = screen.getByTestId('tier-express');
    expect(expressRadio).toBeChecked();
  });

  it('should display all tag options', () => {
    render(
      <EditTeamTagsModal isOpen={true} onClose={() => {}} team={mockTeam} onSave={() => {}} />
    );

    expect(screen.getByText('3SSB Circuit')).toBeInTheDocument();
    expect(screen.getByText('Tournament Ready')).toBeInTheDocument();
    expect(screen.getByText('Recruiting Focus')).toBeInTheDocument();
  });

  it('should have correct tags pre-selected', () => {
    render(
      <EditTeamTagsModal isOpen={true} onClose={() => {}} team={mockTeam} onSave={() => {}} />
    );

    const threeSsbCheckbox = screen.getByTestId('tag-3ssb');
    expect(threeSsbCheckbox).toBeChecked();

    const tournamentCheckbox = screen.getByTestId('tag-tournament');
    expect(tournamentCheckbox).not.toBeChecked();
  });

  it('should call onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(
      <EditTeamTagsModal isOpen={true} onClose={onClose} team={mockTeam} onSave={() => {}} />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <EditTeamTagsModal isOpen={true} onClose={onClose} team={mockTeam} onSave={() => {}} />
    );

    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when X button is clicked', () => {
    const onClose = vi.fn();
    render(
      <EditTeamTagsModal isOpen={true} onClose={onClose} team={mockTeam} onSave={() => {}} />
    );

    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onSave with selected tier and tags', () => {
    const onSave = vi.fn();
    render(<EditTeamTagsModal isOpen={true} onClose={() => {}} team={mockTeam} onSave={onSave} />);

    // Change tier to TNE Elite
    fireEvent.click(screen.getByTestId('tier-tne'));

    // Add tournament tag
    fireEvent.click(screen.getByText('Tournament Ready'));

    // Submit
    fireEvent.click(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledWith({
      tier: 'tne',
      tags: ['3ssb', 'tournament'],
    });
  });

  it('should toggle tags correctly', () => {
    const onSave = vi.fn();
    render(<EditTeamTagsModal isOpen={true} onClose={() => {}} team={mockTeam} onSave={onSave} />);

    // Remove 3ssb tag
    fireEvent.click(screen.getByText('3SSB Circuit'));

    // Add recruiting tag
    fireEvent.click(screen.getByText('Recruiting Focus'));

    // Submit
    fireEvent.click(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledWith({
      tier: 'express',
      tags: ['recruiting'],
    });
  });

  it('should disable Save button when isSaving is true', () => {
    render(
      <EditTeamTagsModal
        isOpen={true}
        onClose={() => {}}
        team={mockTeam}
        onSave={() => {}}
        isSaving={true}
      />
    );

    const saveButton = screen.getByText('Save').closest('button');
    expect(saveButton).toBeDisabled();
  });

  it('should show loader when isSaving is true', () => {
    render(
      <EditTeamTagsModal
        isOpen={true}
        onClose={() => {}}
        team={mockTeam}
        onSave={() => {}}
        isSaving={true}
      />
    );

    const saveButton = screen.getByText('Save').closest('button');
    expect(saveButton.querySelector('svg.animate-spin')).toBeInTheDocument();
  });
});
