<template>
  <div>
    <div class="header-section">
      <div class="header-back-button-wrapper">
        <q-btn
          icon="arrow_back"
          size="lg"
          class="icon-btn back-arrow-btn"
          flat
          @click.prevent="complete"
        />
      </div>
      <h1 class="header-h1">
        {{ $t('success') }}
      </h1>
    </div>
    <div
      v-if="wallet && txData"
      class="modal-layout-wrapper center-modal-content"
    >
      <div class="done-content-wrapper">
        <div class="done-icon-wrapper">
          <q-icon
            name="done"
            class="done-icon"
          />
        </div>

        <div class="done-msg-wrapper">
          <h1>{{ $t('successMessage') }}</h1>
        </div>

        <div class="done-tx-details-wrapper">
          <div class="tx-details-row row">
            <div class="col-3">
              {{ $t('txHash') }}:
            </div>
            <div class="break col-9">
              <span class="tx-hash-span">
                {{ txData.transaction.hash }}
              </span>
              <q-btn
                :label="$t('copy')"
                color="secondary"
                text-color="info"
                size="xs"
                class="copy-hash-btn"
                @click="copyToClipboard"
              />
            </div>
          </div>

          <div class="tx-details-row row">
            <div class="col-3">
              {{ $t('recipient') }}
            </div>
            <div class=" break col-9">
              {{ recipient }}
            </div>
          </div>

          <div class="tx-details-row row">
            <div class="col-3">
              {{ $t('amount') }}
            </div>
            <div class="nowrap col-9">
              {{ amount }}
            </div>
          </div>
        </div>

        <div class="send">
          <q-btn
            :label="$t('close')"
            color="secondary"
            text-color="info"
            size="md"
            @click="complete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { AmountFormatter } from '@/helpers';
import Coin from '@/store/wallet/entities/coin';

export default {
  name: 'SendSuccessContent',
  computed: {
    ...mapState({
      id: (state) => { return state.route.params.id; },
      delay: (state) => { return state.settings.delay; },
      txData: (state) => { return state.modals.sendConfirmTxData; },
    }),
    wallet() {
      return this.$store.getters['entities/wallet/find'](this.id);
    },
    supportedCoins() {
      return Coin.all();
    },
    selectedCurrency() {
      return this.$store.state.settings.selectedCurrency;
    },
    coinSymbol() {
      return this.supportedCoins.find((coin) => { return coin.name === this.wallet.name; }).symbol;
    },
    amount() {
      const inCurrency = this.coinToCurrency(this.txData.transaction.value);
      if (this.latestPrice) {
        return `${this.txData.transaction.value} ${this.coinSymbol} (${inCurrency})`;
      }
      return `${this.txData.transaction.value} ${this.coinSymbol}`;
    },
    recipient() {
      if (Array.isArray(this.txData.transaction.receiver)) {
        return this.txData.transaction.receiver[0];
      }
      return this.txData.transaction.receiver;
    },
    latestPrice() {
      const prices = this.$store.getters['entities/latestPrice/find'](`${this.wallet.identifier}_${this.selectedCurrency.code}`);
      if (prices) {
        return prices.data.PRICE;
      }
      return null;
    },
  },
  methods: {
    complete() {
      this.$store.dispatch('modals/setSendSuccessModalOpened', false);
      this.$router.go(-1);
    },
    coinToCurrency(amount) {
      const formattedAmount = new AmountFormatter({
        amount,
        rate: this.latestPrice,
        format: '0,0[.]00',
        coin: this.wallet.name,
        prependPlusOrMinus: false,
        currency: this.selectedCurrency,
        toCurrency: true,
        withCurrencySymbol: true,
      });

      return formattedAmount.getFormatted();
    },
    copyToClipboard() {
      try {
        if (window.cordova) {
          cordova.plugins.clipboard.copy(this.txData.transaction.hash);
        } else {
          this.$clipboard(this.txData.transaction.hash);
        }
        this.$toast.create(0, this.$t('copied'), this.delay.normal);
      } catch (err) {
        this.errorHandler(err);
      }
    },
  },
};
</script>

<style lang="styl" scoped>
.small-text {
  font-size: 0.8rem;
}

.sending-spinner-overlay {
  position: absolute;
  height: 100vh;
  width: 100vw;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.9);
  opacity: 0;
  transition: all ease-in-out 250ms;
}

.sending-spinner-overlay.active{
  opacity: 1;
  z-index: 2;
}

.done-content-wrapper,
.center-modal-content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
}

.done-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.done-icon-wrapper {
  border: 5px solid #8eff8e;
  height: 7rem;
  width: 7rem;
  border-radius: 100%;
  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5);
  color: #8eff8e;
}

.done-icon {
  font-size: 5rem;
  font-weight: bold;
}

.done-msg-wrapper {
  text-align: center;
  font-family: 'CooperHewitt-SemiboldItalic';
  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5);
}

.done-msg-wrapper h1 {
  margin-top: 1.5rem;
}

.done-tx-details-wrapper {
  width: 100%;
  font-size: 0.7rem;
  background: whitesmoke;
  margin-top: 1rem;
  border-radius: 0.5rem;
}
.body--dark .done-tx-details-wrapper {
  background: $dark;
}

.tx-details-row {
  display: flex;
  border-bottom: 1px solid #2f465a;
  padding: 0.7rem 1rem;
  line-height: 1.5;
}

.tx-details-row:last-of-type {
  border-bottom: none;
}

.break {
  word-break: break-all;
}

.nowrap {
  white-space: nowrap;
}

.detail {
  width: 12rem;
}

.copy-hash-btn {
  font-size: 8px;
  padding: 0.1rem 0.5rem;
  height: 0.9rem;
  line-height: 0;
  min-height: auto;
  position: relative;
  top: -1px;
}

.tx-hash-span {
  margin-right: 0.5rem;
}
</style>
<style>
.copy-hash-btn .q-btn__wrapper {
    min-height: 0;
    padding: 0;
}
</style>
