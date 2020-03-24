using System;
using ReliabilityModel.Model.System;

namespace ReliabilityModel.Model
{
    public class ModuleState
    {
        public ModuleState(SingleModuleSystem module, bool isWorking, int? left = null)
        {
            Left = left;

            IsWorking = isWorking;
            Module = module;
        }

        public SingleModuleSystem Module { get; }

        public bool IsWorking { get; }

        public bool WaitingRecovery => !IsWorking && (!Left.HasValue || Left.Value > 0);

        public bool IsTerminal => Left == 0 && !IsWorking;

        public int? Left { get; }

        public bool IsValidStateChangeTo(ModuleState anotherModuleState)
        {
            if (!Left.HasValue && anotherModuleState.Left.HasValue || Left.HasValue && !anotherModuleState.Left.HasValue)
            {
                throw new ArgumentException("Cannot compare states with infinite and finite recovery numbers.", nameof(anotherModuleState));
            }

            bool infiniteRecoveryPossible = Left == null;
            if (IsWorking != anotherModuleState.IsWorking && infiniteRecoveryPossible)
            {
                return true;
            }

            if (IsWorking && !anotherModuleState.IsWorking && Left == anotherModuleState.Left)
            {
                return true;
            }

            if (!IsWorking && anotherModuleState.IsWorking && Left == anotherModuleState.Left + 1)
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

            return otherState.IsWorking == IsWorking && otherState.Left == Left;
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int hashCode = Left.GetHashCode();
                hashCode = hashCode * 397 ^ (Module != null ? Module.GetHashCode() : 0);
                hashCode = hashCode * 397 ^ IsWorking.GetHashCode();
                return hashCode;
            }
        }

        public override string ToString() => $"{(IsWorking ? "1" : "0")}{(Left.HasValue ? $"[{Left.ToString()}]" : "")}";
    }
}