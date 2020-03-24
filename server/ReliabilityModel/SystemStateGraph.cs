using System.Collections.Generic;
using System.Linq;
using ReliabilityModel.Model.System;

namespace ReliabilityModel.Model
{
    public class SystemStateGraph
    {
        private readonly MultipleModuleSystem _system;

        private readonly IList<SystemState> _allPossibleStates;

        public SystemStateGraph(MultipleModuleSystem system)
        {
            _system = system;

            _allPossibleStates = GetAllPossibleStates();
            Transitions = GetPossibleTransitions();
        }

        public IReadOnlyList<SystemState> AllPossibleStates => (IReadOnlyList<SystemState>)_allPossibleStates;

        public IReadOnlyList<PossibleTransitions> Transitions { get; }

        private IReadOnlyList<PossibleTransitions> GetPossibleTransitions()
        {
            var transitions = new List<PossibleTransitions>();

            foreach (SystemState fromState in AllPossibleStates)
            {
                var transition = new PossibleTransitions(fromState);

                foreach (SystemState toState in AllPossibleStates)
                {
                    bool canTransitTo = fromState.CanTransitTo(toState);
                    if (canTransitTo)
                    {
                        transition.ToSystemStates.Add(toState);
                    }
                }

                transitions.Add(transition);
            }

            return transitions;
        }

        public double[,] BuildWeightMatrix()
        {
            var adjacencyMatrix = new double[AllPossibleStates.Count, AllPossibleStates.Count];
            for (var fromStateIdx = 0; fromStateIdx < AllPossibleStates.Count; fromStateIdx++)
            {
                SystemState currentState = AllPossibleStates[fromStateIdx];

                PossibleTransitions transitionsForState = Transitions
                    .SingleOrDefault(transition => transition.SystemState == currentState);

                if (transitionsForState == null)
                {
                    continue;
                }

                foreach (SystemState nextState in transitionsForState.ToSystemStates)
                {
                    currentState.GetTransitionRate(nextState, out double rate);
                    int toStateIdx = _allPossibleStates.IndexOf(nextState);

                    adjacencyMatrix[fromStateIdx, toStateIdx] -= rate;
                    adjacencyMatrix[toStateIdx, fromStateIdx] += rate;
                }
            }

            return adjacencyMatrix;
        }

        private IList<SystemState> GetAllPossibleStates()
        {
            IReadOnlyList<SingleModuleSystem> singleModules = new SubSystemModuleAggregationVisitor().VisitSubSystem(_system);

            IReadOnlyList<IReadOnlyList<ModuleState>> modulesStates = singleModules
                .Select(singleModuleSystem => singleModuleSystem.GetModuleStates())
                .ToList();

            int[] maxValues = modulesStates.Select(list => list.Count - 1).ToArray();
            var systemStates = new List<int[]>
            {
                Enumerable.Repeat(0, maxValues.Length).ToArray()
            };

            var integerOperator = new IntegerSetOperator(maxValues);
            while (!integerOperator.IsMax(systemStates.Last()))
            {
                systemStates.Add(integerOperator.Increment(systemStates.Last()));
            }

            return systemStates
                .Select((indices, index) => SystemState.FromModuleStatesIndices(_system, indices, modulesStates, index))
                .ToList();
        }
    }
}