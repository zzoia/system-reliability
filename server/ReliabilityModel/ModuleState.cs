using ReliabilityModel.Model.System;
using System;

namespace ReliabilityModel.Model
{
    public class ModuleState
    {
        public ModuleState(
            SingleModuleSystem module,
            bool isWorking,
            int? recoveriesLeft)
        {
            RecoveriesLeft = recoveriesLeft;

            IsWorking = isWorking;
            Module = module;
        }

        public SingleModuleSystem Module { get; }

        public bool IsWorking { get; }

        public bool WaitingRecovery => !IsWorking && (!RecoveriesLeft.HasValue || RecoveriesLeft.Value > 0);

        public bool IsTerminal => RecoveriesLeft == 0 && !IsWorking;

        public int? RecoveriesLeft { get; }

        public bool IsValidStateChangeTo(ModuleState anotherModuleState)
        {
            if (!RecoveriesLeft.HasValue && anotherModuleState.RecoveriesLeft.HasValue ||
                RecoveriesLeft.HasValue && !anotherModuleState.RecoveriesLeft.HasValue)
            {
                throw new ArgumentException(
                    "Cannot compare states with infinite and finite recovery numbers.",
                    nameof(anotherModuleState));
            }

            var infiniteRecoveryPossible = RecoveriesLeft == null;
            if (IsWorking != anotherModuleState.IsWorking && infiniteRecoveryPossible)
            {
                return true;
            }

            if (IsWorking && !anotherModuleState.IsWorking && RecoveriesLeft == anotherModuleState.RecoveriesLeft)
            {
                return true;
            }

            if (!IsWorking && anotherModuleState.IsWorking && RecoveriesLeft == anotherModuleState.RecoveriesLeft + 1)
            {
                return true;
            }

            return false;
        }

        public override bool Equals(object otherObject)
        {
            if (!(otherObject is ModuleState otherState))
            {
                return false;
            }

            return otherState.IsWorking == IsWorking && otherState.RecoveriesLeft == RecoveriesLeft;
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = RecoveriesLeft.GetHashCode();
                hashCode = (hashCode * 397) ^ (Module != null ? Module.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ IsWorking.GetHashCode();
                return hashCode;
            }
        }

        public override string ToString() => $"{(IsWorking ? 1.ToString() : 0.ToString())}{(RecoveriesLeft.HasValue ? $"[{RecoveriesLeft}]" : string.Empty)}";
    }
}