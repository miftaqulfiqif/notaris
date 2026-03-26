import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkActionToast } from './BulkActionToast';

describe('BulkActionToast', () => {
    const defaultProps = {
        onRename: jest.fn(),
        onToggleFavorite: jest.fn(),
        onDownload: jest.fn(),
        onMoveToTrash: jest.fn(),
        onCancel: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all action buttons', () => {
        render(<BulkActionToast {...defaultProps} />);

        expect(screen.getByText('Ganti nama')).toBeInTheDocument();
        expect(screen.getByText('Tambahkan ke berbintang')).toBeInTheDocument();
        expect(screen.getByText('Download')).toBeInTheDocument();
        expect(screen.getByText('Tambahkan ke sampah')).toBeInTheDocument();
        expect(screen.getByText('Batal')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('calls onRename when Ganti nama is clicked', async () => {
        const user = userEvent.setup();
        render(<BulkActionToast {...defaultProps} />);

        await user.click(screen.getByText('Ganti nama'));
        expect(defaultProps.onRename).toHaveBeenCalledTimes(1);
    });

    it('calls onToggleFavorite when Berbintang button is clicked', async () => {
        const user = userEvent.setup();
        render(<BulkActionToast {...defaultProps} />);

        await user.click(screen.getByText('Tambahkan ke berbintang'));
        expect(defaultProps.onToggleFavorite).toHaveBeenCalledTimes(1);
    });

    it('calls onDownload when Download is clicked', async () => {
        const user = userEvent.setup();
        render(<BulkActionToast {...defaultProps} />);

        await user.click(screen.getByText('Download'));
        expect(defaultProps.onDownload).toHaveBeenCalledTimes(1);
    });

    it('calls onMoveToTrash when Sampah button is clicked', async () => {
        const user = userEvent.setup();
        render(<BulkActionToast {...defaultProps} />);

        await user.click(screen.getByText('Tambahkan ke sampah'));
        expect(defaultProps.onMoveToTrash).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Batal is clicked', async () => {
        const user = userEvent.setup();
        render(<BulkActionToast {...defaultProps} />);

        await user.click(screen.getByText('Batal'));
        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('uses custom favoriteLabel and trashLabel', () => {
        render(
            <BulkActionToast
                {...defaultProps}
                favoriteLabel="Hapus dari Berbintang"
                trashLabel="Hapus permanen"
            />,
        );

        expect(screen.getByText('Hapus dari Berbintang')).toBeInTheDocument();
        expect(screen.getByText('Hapus permanen')).toBeInTheDocument();
    });

    it('hides Ganti nama when showRename is false', () => {
        render(<BulkActionToast {...defaultProps} showRename={false} />);
        expect(screen.queryByText('Ganti nama')).not.toBeInTheDocument();
    });

    it('disables buttons when disabled is true', () => {
        render(<BulkActionToast {...defaultProps} disabled />);

        const buttons = screen.getAllByRole('button');
        buttons.forEach((button) => {
            expect(button).toBeDisabled();
        });
    });
});
