import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import TokenABI from '../../contracts/SimpleDeFiToken.json';
import TokenAddress from '../../contracts/SimpleDeFiToken-address.json';
import { useWeb3React } from '@web3-react/core';
import {
    Box,
    Button,
    CircularProgress,
    GlobalStyles,
    InputBase,
    Stack,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { localProvider } from '../../components/Wallet';

const HARDHAT_CHAIN_ID = 31337n;
// The burn transfer burns 10% of the amount (matches the text in the form).
// Change this number if your contract uses a different rate.
const BURN_PERCENT = 10n;

// Colors used on this page
const c = {
    bg: '#0b0f1a',
    card: '#131a2b',
    field: '#0d1424',
    border: '#222c47',
    text: '#e8ecff',
    muted: '#8a94b8',
    accent: 'linear-gradient(90deg, #7c5cff 0%, #3ea6ff 100%)',
    focus: '#7c5cff',
    ok: '#3ddc97',
};

const fmt = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0';
};

const shorten = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`;

const Stat = ({ label, value }) => (
    <Box
        sx={{
            flex: 1,
            p: 2.5,
            borderRadius: 3,
            bgcolor: c.card,
            border: `1px solid ${c.border}`,
        }}
    >
        <Typography sx={{ color: c.muted, fontSize: 13 }}>{label}</Typography>
        <Typography sx={{ color: c.text, fontSize: 24, fontWeight: 600, mt: 0.5 }}>
            {value} <span style={{ color: c.muted, fontSize: 14, fontWeight: 400 }}>SDFT</span>
        </Typography>
    </Box>
);

const FieldBox = ({ label, right, children }) => (
    <Box
        sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: c.field,
            border: `1px solid ${c.border}`,
            '&:focus-within': { borderColor: c.focus },
        }}
    >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography sx={{ color: c.muted, fontSize: 13 }}>{label}</Typography>
            {right}
        </Stack>
        {children}
    </Box>
);

const SummaryRow = ({ label, value }) => (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
        <Typography sx={{ color: c.muted, fontSize: 14 }}>{label}</Typography>
        <Typography sx={{ color: c.text, fontSize: 14 }}>{value}</Typography>
    </Stack>
);

const TokenOperations = () => {
    const { active, account } = useWeb3React();

    const [totalSupply, setTotalSupply] = useState('0');
    const [yourBalance, setYourBalance] = useState('0');
    const [mode, setMode] = useState('normal'); // 'normal' or 'burn'
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [sending, setSending] = useState(false);

    const autoBurn = mode === 'burn';

    const getTotalSupply = useCallback(async () => {
        try {
            const contract = new ethers.Contract(TokenAddress.address, TokenABI.abi, localProvider);
            const response = await contract.totalSupply();
            setTotalSupply(ethers.formatEther(response));
        } catch (error) {
            console.error('Cannot get total supply', error);
        }
    }, []);

    // Balance is read through localProvider (same as total supply),
    // so it does not depend on which network MetaMask is on.
    const getYourBalance = useCallback(async () => {
        if (!active || !account) {
            setYourBalance('0');
            return;
        }
        try {
            const contract = new ethers.Contract(TokenAddress.address, TokenABI.abi, localProvider);
            const response = await contract.balanceOf(account);
            setYourBalance(ethers.formatEther(response));
        } catch (error) {
            console.error('Cannot get your balance', error);
        }
    }, [account, active]);

    useEffect(() => {
        getTotalSupply();
        getYourBalance();
    }, [getTotalSupply, getYourBalance]);

    // Amount as a big number (null if empty or not a valid number)
    const parsed = useMemo(() => {
        if (amount === '') return null;
        try {
            return ethers.parseUnits(amount, 'ether');
        } catch {
            return null;
        }
    }, [amount]);

    const balanceWei = useMemo(() => {
        try {
            return ethers.parseUnits(yourBalance, 'ether');
        } catch {
            return 0n;
        }
    }, [yourBalance]);

    // Text and state of the main button, like most DeFi apps do
    let buttonLabel = autoBurn ? 'Transfer with burn' : 'Transfer';
    let blocked = false;
    if (!active) {
        buttonLabel = 'Connect your wallet first';
        blocked = true;
    } else if (!address) {
        buttonLabel = 'Enter recipient address';
        blocked = true;
    } else if (!ethers.isAddress(address)) {
        buttonLabel = 'Invalid recipient address';
        blocked = true;
    } else if (parsed === null || parsed <= 0n) {
        buttonLabel = 'Enter an amount';
        blocked = true;
    } else if (parsed > balanceWei) {
        buttonLabel = 'Insufficient SDFT balance';
        blocked = true;
    }

    const burned = parsed !== null && parsed > 0n ? (parsed * BURN_PERCENT) / 100n : 0n;
    const received = parsed !== null && parsed > 0n ? parsed - burned : 0n;
    const showSummary = !blocked || (parsed !== null && parsed > 0n && address !== '');

    const handleAmountChange = (e) => {
        const next = e.target.value;
        if (/^\d*\.?\d*$/.test(next)) setAmount(next);
    };

    const handleTransfer = async () => {
        if (blocked || sending) return;
        setSending(true);
        const type = autoBurn ? 'auto burn' : 'normal';
        try {
            // Sending goes through MetaMask, so it must be on the Hardhat network.
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            if (network.chainId !== HARDHAT_CHAIN_ID) {
                toast.error('MetaMask is not on the Hardhat network (chain ID 31337). Switch network and try again.');
                return;
            }
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(TokenAddress.address, TokenABI.abi, signer);
            const tx = autoBurn
                ? await contract.transferWithAutoBurn(address, parsed)
                : await contract.transfer(address, parsed);
            toast.info(`Transaction Submitted! TxHash: ${tx.hash}`);
            await tx.wait();
            toast.info(`Transaction Succeeded! TxHash: ${tx.hash}`);
            setAddress('');
            setAmount('');
            getTotalSupply();
            getYourBalance();
        } catch (error) {
            toast.error(`Cannot perform ${type} transfer!`);
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <GlobalStyles styles={{ 'html, body': { backgroundColor: c.bg } }} />

            <Box sx={{ maxWidth: 520, mx: 'auto', py: { xs: 3, sm: 5 }, px: 2, color: c.text }}>
                {/* Title and connected account */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 3 }}
                >
                    <Box>
                        <Typography sx={{ fontSize: 26, fontWeight: 700, color: c.text }}>
                            Simple DeFi Token
                        </Typography>
                        <Typography sx={{ color: c.muted, fontSize: 14 }}>
                            Send SDFT to any address on the Hardhat network.
                        </Typography>
                    </Box>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            px: 1.5,
                            py: 0.75,
                            borderRadius: 99,
                            bgcolor: c.card,
                            border: `1px solid ${c.border}`,
                        }}
                    >
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: active ? c.ok : c.muted,
                            }}
                        />
                        <Typography sx={{ color: c.text, fontSize: 13 }}>
                            {active && account ? shorten(account) : 'Not connected'}
                        </Typography>
                    </Stack>
                </Stack>

                {/* Supply and balance */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                    <Stat label="Total supply" value={fmt(totalSupply)} />
                    <Stat label="Your balance" value={fmt(yourBalance)} />
                </Stack>

                {/* Transfer card */}
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 4,
                        bgcolor: c.card,
                        border: `1px solid ${c.border}`,
                    }}
                >
                    <Tabs
                        value={mode}
                        onChange={(e, next) => setMode(next)}
                        variant="fullWidth"
                        sx={{
                            mb: 2,
                            '& .MuiTabs-indicator': { height: 3, borderRadius: 2, background: c.accent },
                        }}
                    >
                        <Tab
                            value="normal"
                            label="Transfer"
                            sx={{
                                textTransform: 'none',
                                fontSize: 15,
                                color: c.muted,
                                '&.Mui-selected': { color: c.text },
                            }}
                        />
                        <Tab
                            value="burn"
                            label="Transfer with burn"
                            sx={{
                                textTransform: 'none',
                                fontSize: 15,
                                color: c.muted,
                                '&.Mui-selected': { color: c.text },
                            }}
                        />
                    </Tabs>

                    <Stack spacing={1.5}>
                        <FieldBox label="Recipient address">
                            <InputBase
                                fullWidth
                                placeholder="0x..."
                                value={address}
                                onChange={(e) => setAddress(e.target.value.trim())}
                                inputProps={{ spellCheck: false, autoComplete: 'off' }}
                                sx={{ color: c.text, fontSize: 16 }}
                            />
                        </FieldBox>

                        <FieldBox
                            label="Amount"
                            right={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography sx={{ color: c.muted, fontSize: 13 }}>
                                        Balance: {fmt(yourBalance)}
                                    </Typography>
                                    <Button
                                        size="small"
                                        disabled={!active}
                                        onClick={() => setAmount(yourBalance)}
                                        sx={{
                                            minWidth: 0,
                                            px: 1,
                                            py: 0,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: c.focus,
                                            bgcolor: 'rgba(124, 92, 255, 0.12)',
                                            '&:hover': { bgcolor: 'rgba(124, 92, 255, 0.22)' },
                                        }}
                                    >
                                        MAX
                                    </Button>
                                </Stack>
                            }
                        >
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <InputBase
                                    fullWidth
                                    placeholder="0.0"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    inputProps={{ inputMode: 'decimal' }}
                                    sx={{ color: c.text, fontSize: 28, fontWeight: 600 }}
                                />
                                <Typography sx={{ color: c.muted, fontWeight: 600 }}>SDFT</Typography>
                            </Stack>
                        </FieldBox>

                        {autoBurn && (
                            <Typography sx={{ color: c.muted, fontSize: 13, px: 0.5 }}>
                                {String(BURN_PERCENT)}% of the amount is burned automatically.
                            </Typography>
                        )}

                        {showSummary && parsed !== null && parsed > 0n && (
                            <Box sx={{ px: 0.5 }}>
                                {autoBurn ? (
                                    <>
                                        <SummaryRow
                                            label={`Burned (${String(BURN_PERCENT)}%)`}
                                            value={`${fmt(ethers.formatEther(burned))} SDFT`}
                                        />
                                        <SummaryRow
                                            label="Recipient receives"
                                            value={`${fmt(ethers.formatEther(received))} SDFT`}
                                        />
                                    </>
                                ) : (
                                    <SummaryRow
                                        label="Recipient receives"
                                        value={`${fmt(ethers.formatEther(parsed))} SDFT`}
                                    />
                                )}
                                <SummaryRow label="Network" value="Hardhat (31337)" />
                            </Box>
                        )}
                    </Stack>

                    <Button
                        fullWidth
                        disabled={blocked || sending}
                        onClick={handleTransfer}
                        sx={{
                            mt: 2,
                            py: 1.8,
                            borderRadius: 3,
                            fontSize: 17,
                            fontWeight: 600,
                            textTransform: 'none',
                            color: '#fff',
                            background: c.accent,
                            '&:hover': { background: c.accent, filter: 'brightness(1.1)' },
                            '&.Mui-disabled': {
                                background: c.field,
                                color: c.muted,
                                border: `1px solid ${c.border}`,
                            },
                        }}
                    >
                        {sending ? (
                            <>
                                <CircularProgress size={18} sx={{ color: 'inherit', mr: 1 }} />
                                Confirm in your wallet...
                            </>
                        ) : (
                            buttonLabel
                        )}
                    </Button>
                </Box>
            </Box>
        </>
    );
};

export default TokenOperations;