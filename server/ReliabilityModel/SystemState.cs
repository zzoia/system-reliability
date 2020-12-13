using System.Collections.Generic;
using System.Linq;
using ReliabilityModel.Model.System;

namespace ReliabilityModel.Model
{
    public class SystemState
    {
        private class OneStateTransition
        {
            public OneStateTransition(ModuleState from, ModuleState to)
            {
                From = from;
                To = to;
            }

            public ModuleState From { get; }

            public ModuleState To { get; }
        }

        private SystemState(IReadOnlyList<ModuleState> moduleStates, int index)
        {
            ModuleStates = moduleStates;
            Index = index;
        }

        public bool IsTerminal { get; private set; }

        public bool IsWaitingRecovery { get; private set; }

        public bool IsWorking { get; private set; }

        public IReadOnlyList<ModuleState> ModuleStates { get; }

        public int Index { get; }

        public bool GetTransitionRate(SystemState anotherSystemState, out double transitionRate, out bool isRecovering)
        {
            isRecovering = false;
            transitionRate = 0;

            OneStateTransition transition = GetOneChangeTransition(anotherSystemState);
            if (transition == null)
            {
                return false;
            }

            isRecovering = !transition.From.IsWorking && transition.To.IsWorking;

            transitionRate = isRecovering
                ? transition.From.Module.RecoveryRate
                : transition.From.Module.FailureRate;

            return true;
        }

        public override string ToString() => $"[{string.Join("", ModuleStates.Select(state => state.ToString()))}]";

        public static SystemState FromModuleStatesIndices(
            MultipleModuleSystem system,
            int[] moduleStateIndices,
            IReadOnlyList<IReadOnlyList<ModuleState>> modulesStates,
            int stateIndex)
        {
            var moduleStates = new List<ModuleState>();
            for (var index = 0; index < moduleStateIndices.Length; index++)
            {
                IReadOnlyList<ModuleState> possibleModuleStates = modulesStates[index];
                int moduleStateIndex = moduleStateIndices[index];
                moduleStates.Add(possibleModuleStates[moduleStateIndex]);
            }

            var systemState = new SystemState(moduleStates, stateIndex);
            systemState.IsTerminal = system.IsStateTerminal(systemState);
            systemState.IsWaitingRecovery = system.WaitingRecovery(systemState);
            systemState.IsWorking = system.IsWorking(systemState);

            return systemState;
        }

        private OneStateTransition GetOneChangeTransition(SystemState anotherSystemState)
        {
            List<OneStateTransition> transitionPairs = ModuleStates
                .Zip(anotherSystemState.ModuleStates, (from, to) => new OneStateTransition(from, to))
                .ToList();

            List<OneStateTransition> notEqualPairs = transitionPairs.Where(pair => !pair.From.Equals(pair.To)).ToList();
            if (notEqualPairs.Count != 1)
            {
                return null;
            }

            OneStateTransition transition = notEqualPairs.Single();
            return transition.From.IsValidStateChangeTo(transition.To) ? transition : null;
        }
    }
}