import { render, screen, waitFor } from '@testing-library/react';
import QRCode from 'qrcode';
import { PaymentInstructions } from './PaymentInstructions';

jest.mock('qrcode', () => ({
    __esModule: true,
    default: {
        toDataURL: jest.fn(),
    },
}));

const mockedQRCode = QRCode as { toDataURL: jest.Mock };

describe('PaymentInstructions', () => {
    beforeEach(() => {
        mockedQRCode.toDataURL.mockReset();
    });

    it('uses a remote QR image directly when Midtrans returns generate-qr-code url', () => {
        render(
            <PaymentInstructions
                transaction={{
                    amount: 555000,
                    id: 'txn-1',
                    method: 'qris',
                    status: 'pending',
                    instruction_payload: {
                        qr_url: 'https://example.com/qr.png',
                    },
                }}
            />,
        );

        const image = screen.getByRole('img', { name: 'QR pembayaran' });
        expect(image).toHaveAttribute('src', 'https://example.com/qr.png');
        expect(mockedQRCode.toDataURL).not.toHaveBeenCalled();
    });

    it('renders qr_string as a scannable QR image when Midtrans does not return a QR url', async () => {
        mockedQRCode.toDataURL.mockResolvedValue('data:image/png;base64,generated-qr');

        render(
            <PaymentInstructions
                transaction={{
                    amount: 555000,
                    id: 'txn-2',
                    method: 'qris',
                    status: 'pending',
                    instruction_payload: {
                        qr_url: '00020101021226620014COM.GO-JEK.WWW01189360091430519754890210G123456789',
                    },
                }}
            />,
        );

        await waitFor(() => {
            expect(screen.getByRole('img', { name: 'QR pembayaran' })).toHaveAttribute(
                'src',
                'data:image/png;base64,generated-qr',
            );
        });

        expect(mockedQRCode.toDataURL).toHaveBeenCalledWith(
            '00020101021226620014COM.GO-JEK.WWW01189360091430519754890210G123456789',
            {
                errorCorrectionLevel: 'M',
                margin: 1,
                width: 220,
            },
        );
    });
});
