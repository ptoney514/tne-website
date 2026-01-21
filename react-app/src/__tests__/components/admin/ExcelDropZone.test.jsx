import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExcelDropZone from '../../../components/admin/ExcelDropZone';

// Helper to create a mock file
function createMockFile(name = 'test.xlsx', type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size = 1024) {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('ExcelDropZone', () => {
  it('renders upload prompt', () => {
    render(<ExcelDropZone onFileSelect={() => {}} />);

    expect(screen.getByText(/drag & drop your excel file/i)).toBeInTheDocument();
    expect(screen.getByText(/or click to browse/i)).toBeInTheDocument();
  });

  it('displays supported file types', () => {
    render(<ExcelDropZone onFileSelect={() => {}} />);

    expect(screen.getByText(/supports .xlsx and .xls files/i)).toBeInTheDocument();
  });

  it('calls onFileSelect when a valid file is selected', async () => {
    const onFileSelect = vi.fn();
    render(<ExcelDropZone onFileSelect={onFileSelect} />);

    const file = createMockFile();
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(file);
    });
  });

  it('shows file name after selection', async () => {
    const onFileSelect = vi.fn();
    render(<ExcelDropZone onFileSelect={onFileSelect} />);

    const file = createMockFile('my-teams.xlsx');
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('my-teams.xlsx')).toBeInTheDocument();
    });
  });

  it('shows error for invalid file type', async () => {
    const onFileSelect = vi.fn();
    render(<ExcelDropZone onFileSelect={onFileSelect} />);

    const file = createMockFile('document.pdf', 'application/pdf');
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/please select an excel file/i)).toBeInTheDocument();
    });
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('shows error for file that is too large', async () => {
    const onFileSelect = vi.fn();
    render(<ExcelDropZone onFileSelect={onFileSelect} />);

    // 11MB file (over 10MB limit)
    const file = createMockFile('large.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 11 * 1024 * 1024);
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/file is too large/i)).toBeInTheDocument();
    });
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('allows clearing selected file', async () => {
    const onFileSelect = vi.fn();
    render(<ExcelDropZone onFileSelect={onFileSelect} />);

    const file = createMockFile();
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.xlsx')).toBeInTheDocument();
    });

    const removeButton = screen.getByText(/remove file/i);
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText(/drag & drop your excel file/i)).toBeInTheDocument();
    });
    expect(onFileSelect).toHaveBeenLastCalledWith(null);
  });

  it('is disabled when disabled prop is true', () => {
    render(<ExcelDropZone onFileSelect={() => {}} disabled={true} />);

    const dropzone = document.querySelector('input[type="file"]');
    expect(dropzone).toBeDisabled();
  });

  it('accepts .xls files', async () => {
    const onFileSelect = vi.fn();
    render(<ExcelDropZone onFileSelect={onFileSelect} />);

    const file = createMockFile('old-format.xls', 'application/vnd.ms-excel');
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(file);
    });
  });

  it('shows file size after selection', async () => {
    render(<ExcelDropZone onFileSelect={() => {}} />);

    const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 2048);
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('2.0 KB')).toBeInTheDocument();
    });
  });

  it('handles drag over state', () => {
    render(<ExcelDropZone onFileSelect={() => {}} />);

    const dropzone = screen.getByText(/drag & drop your excel file/i).closest('div');

    fireEvent.dragOver(dropzone, {
      dataTransfer: { files: [] },
    });

    expect(screen.getByText(/drop your file here/i)).toBeInTheDocument();
  });
});
