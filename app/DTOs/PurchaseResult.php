<?php

namespace App\DTOs;

readonly class PurchaseResult
{
    public function __construct(
        public bool $success,
        public ?string $providerOrderId = null,
        public ?string $iccid = null,
        public ?string $activationCode = null,
        public ?string $smdpAddress = null,
        public ?string $qrCodeData = null,
        public ?string $lpaString = null,
        public ?string $pin = null,
        public ?string $puk = null,
        public ?string $apn = null,
        public ?int $dataTotalBytes = null,
        public ?string $errorMessage = null,
        public ?string $errorCode = null,
        public bool $isRetryable = false,
        public array $providerData = [],
    ) {}

    public static function success(
        string $providerOrderId,
        string $iccid,
        string $activationCode,
        ?string $smdpAddress = null,
        ?string $qrCodeData = null,
        ?string $lpaString = null,
        ?string $pin = null,
        ?string $puk = null,
        ?string $apn = null,
        ?int $dataTotalBytes = null,
        array $providerData = [],
    ): self {
        return new self(
            success: true,
            providerOrderId: $providerOrderId,
            iccid: $iccid,
            activationCode: $activationCode,
            smdpAddress: $smdpAddress,
            qrCodeData: $qrCodeData,
            lpaString: $lpaString,
            pin: $pin,
            puk: $puk,
            apn: $apn,
            dataTotalBytes: $dataTotalBytes,
            providerData: $providerData,
        );
    }

    public static function failure(
        string $errorMessage,
        ?string $errorCode = null,
        bool $isRetryable = false,
    ): self {
        return new self(
            success: false,
            errorMessage: $errorMessage,
            errorCode: $errorCode,
            isRetryable: $isRetryable,
        );
    }

    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'provider_order_id' => $this->providerOrderId,
            'iccid' => $this->iccid,
            'activation_code' => $this->activationCode,
            'smdp_address' => $this->smdpAddress,
            'qr_code_data' => $this->qrCodeData,
            'lpa_string' => $this->lpaString,
            'pin' => $this->pin,
            'puk' => $this->puk,
            'apn' => $this->apn,
            'data_total_bytes' => $this->dataTotalBytes,
            'error_message' => $this->errorMessage,
            'error_code' => $this->errorCode,
            'is_retryable' => $this->isRetryable,
            'provider_data' => $this->providerData,
        ];
    }

    public function getLpaString(): ?string
    {
        if ($this->lpaString) {
            return $this->lpaString;
        }
        if ($this->smdpAddress && $this->activationCode) {
            return "LPA:1\${$this->smdpAddress}\${$this->activationCode}";
        }
        return null;
    }
}
