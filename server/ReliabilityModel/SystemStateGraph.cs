using System.Collections.Generic;
using System.Linq;
using Microsoft.Research.Oslo;
using ReliabilityModel.Model.Helpers;
using ReliabilityModel.Model.System;

namespace ReliabilityModel.Model
{
    public class SystemStateGraph
    {
        private readonly MultipleModuleSystem _system;

        private IList<SystemState> _allPossibleStates;

        public SystemStateGraph(MultipleModuleSystem system, bool includeTerminal)
        {
            _system = system;

            _allPossibleStates = GetAllPossibleStates();
            Transitions = GetPossibleTransitions(includeTerminal);
        }

        public IReadOnlyList<SystemState> AllPossibleStates => (IReadOnlyList<SystemState>) _allPossibleStates;

        public IReadOnlyList<PossibleTransitions> Transitions { get; }

        private IReadOnlyList<PossibleTransitions> GetPossibleTransitions(bool includeTerminal)
        {
            var transitions = new List<PossibleTransitions>();

            foreach (SystemState fromState in AllPossibleStates)
            {
                var transition = new PossibleTransitions(fromState);
                if (includeTerminal || !fromState.IsTerminal)
                {
                    foreach (SystemState toState in AllPossibleStates)
                    {
                        bool canTransitTo =
                            fromState.GetTransitionRate(toState, out double rate, out bool isRecovering);

                        if (canTransitTo)
                        {
                            transition.ToSystemStates.Add(new SystemStateTransition
                            {
                                ToSystemState = toState,
                                IsRecovering = isRecovering,
                                WithRate = rate
                            });
                        }
                    }
                }

                transitions.Add(transition);
            }

            if (!includeTerminal)
            {
                List<SystemState> allDestinations = transitions
                    .SelectMany(transition => transition.ToSystemStates)
                    .Select(transition => transition.ToSystemState)
                    .ToList();

                List<SystemState> allSources = transitions
                    .Select(transition => transition.SystemState)
                    .ToList();

                transitions = transitions
                    .Where(transition =>
                        allDestinations.Contains(transition.SystemState) || transition.ToSystemStates.Any())
                    .ToList();

                _allPossibleStates = transitions.Select(transition => transition.SystemState).ToList();
            }

            return transitions;
        }

        public double[,] BuildWeightMatrix()
        {
            var equations = new double[AllPossibleStates.Count, AllPossibleStates.Count];
            for (var fromStateIdx = 0; fromStateIdx < AllPossibleStates.Count; fromStateIdx++)
            {
                SystemState currentState = AllPossibleStates[fromStateIdx];

                PossibleTransitions transitionsForState = Transitions
                    .SingleOrDefault(transition => transition.SystemState == currentState);

                if (transitionsForState == null) continue;

                foreach (SystemStateTransition nextState in transitionsForState.ToSystemStates)
                {
                    int toStateIdx = _allPossibleStates.IndexOf(nextState.ToSystemState);

                    equations[fromStateIdx, fromStateIdx] -= nextState.WithRate;
                    equations[toStateIdx, fromStateIdx] += nextState.WithRate;
                }
            }

            return equations;
        }

        public IReadOnlyList<WorkingProbability> GetProbability(double from, double to, double step)
        {
            double[,] equations = BuildWeightMatrix();

            var initial = new Vector(Enumerable.Repeat(0.0, AllPossibleStates.Count).ToArray());
            initial[0] = 1.0;
            IEnumerable<SolPoint> solution = Ode.RK547M(0, initial, (_, vector) =>
            {
                var result = new double[vector.Length];
                for (var state = 0; state < result.Length; state++)
                {
                    result[state] = 0;
                    for (var component = 0; component < result.Length; component++)
                        result[state] += equations[state, component] * vector[component];
                }

                return new Vector(result);
            });

            int[] workingIndices = AllPossibleStates
                .Select((state, index) => new {index, state.IsWorking})
                .Where(state => state.IsWorking)
                .Select(state => state.index)
                .ToArray();

            SolPoint[] points = solution.SolveFromToStep(from, to, step).ToArray();
            return points.Select(point => new WorkingProbability
            {
                Time = point.T,
                AggregatedProbability = point.X.ToArray().Where((_, index) => workingIndices.Contains(index)).Sum()
            }).ToList();
        }

        private IList<SystemState> GetAllPossibleStates()
        {
            IReadOnlyCollection<SingleModuleSystem> singleModules = _system.Flatten();

            IReadOnlyList<IReadOnlyList<ModuleState>> allModulesStates = singleModules
                .Select(singleModule => singleModule.GetPossibleNextStates())
                .ToList();

            int[] maxValues = allModulesStates.Select(singleModuleStates => singleModuleStates.Count - 1).ToArray();
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
                .Select((indices, index) =>
                    SystemState.FromModuleStatesIndices(_system, indices, allModulesStates, index))
                .ToList();
        }
    }
}